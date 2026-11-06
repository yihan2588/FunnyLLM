import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { requestOrigin } from "@/lib/request-origin";
import { inputSchema, generatedOptionSchema, keepsLiterals, runtimeSchema, DEFAULT_RUNTIME, lengthEditError, catalogAsset, VERSION, INDEX_VERSION, type State, type DraftInput, type CatalogImage, type Edit } from "./contracts";
import { generate, CowriterError, type Timing } from "./provider";
import { withCleanAngle } from "./refusal";
import { editPrompt, CLEAN_ANGLE } from "./prompts";
import { writeDraft } from "./workflow";

export const json = (data: unknown, status = 200) => Response.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
export function failure(error: unknown) {
  return json({error:error instanceof CowriterError ? error.message : error instanceof z.ZodError ? error.issues[0]?.message : error instanceof SyntaxError ? "Send a valid JSON request." : "This request could not be completed."},error instanceof CowriterError?error.status:error instanceof z.ZodError||error instanceof SyntaxError?400:500);
}
export async function context(request: Request, mutate=true) {
  if(mutate && request.headers.get("origin")!==requestOrigin(request.headers)) throw new CowriterError("Invalid request origin.",403);
  const user=await getUser();if(!user)throw new CowriterError("Sign in to write your meme.",401);
  const client=await createClient();const key=process.env.HUMOR_WRITER_KEY;
  if(!key) throw new CowriterError("The writer is temporarily unavailable.",503);
  return {user,client,key};
}
export async function boundedBody(request: Request,max=16384) {
  if(Number(request.headers.get("content-length")??0)>max)throw new CowriterError("This request is too large.",413);
  const reader=request.body?.getReader();if(!reader)throw new CowriterError("Add your request.",400);
  const chunks:Uint8Array[]=[];let length=0;
  while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>max){await reader.cancel();throw new CowriterError("This request is too large.",413);}chunks.push(value);}
  return Buffer.concat(chunks);
}
export async function readState(client: Awaited<ReturnType<typeof createClient>>,session: string,revision?: number): Promise<State> {
  if(!z.uuid().safeParse(session).success)throw new CowriterError("Draft not found.",404);
  const {data,error}=await client.rpc("cowriter_read",{p_session:session,p_revision:revision??null});
  if(error||!data)throw new CowriterError("Draft not found.",404);return data as State;
}
export async function imageBytes(client: Awaited<ReturnType<typeof createClient>>,state:State,imageId:string) {
  const pic=state.input.mode==="pic";
  const mediaPath=state.input.mode==="pic"&&imageId==="upload" ? state.input.uploadPath : state.pool.find(i=>i.id===imageId)?.storage_path;
  if(!mediaPath || (pic&&imageId!=="upload"))throw new CowriterError("Image not found.",404);
  if(!pic){
    await catalogImage(client,state,imageId);
    const asset=catalogAsset(mediaPath);
    if(!asset)throw new CowriterError("Image not found.",404);
    if(asset.bucket==="funny-library"){
      const {data,error}=await client.storage.from(asset.bucket).download(asset.path);
      if(error||!data)throw new CowriterError("This image could not be loaded. Please try another.",502);
      return Buffer.from(await data.arrayBuffer());
    }
    if(process.env.VERCEL_URL){
      const res=await fetch(`https://${process.env.VERCEL_URL}/catalog/${mediaPath}`,{signal:AbortSignal.timeout(5000),redirect:"error"});
      if(!res.ok)throw new CowriterError("This image is unavailable. Try another.");return Buffer.from(await res.arrayBuffer());
    }
    return readFile(path.join(process.cwd(),"public/catalog",mediaPath));
  }
  const {data,error}=await client.storage.from("cowriter-uploads").download(mediaPath);
  if(error||!data)throw new CowriterError("This image could not be loaded. Please try another.",502);
  return Buffer.from(await data.arrayBuffer());
}
async function catalogImage(client: Awaited<ReturnType<typeof createClient>>,state:State,imageId:string) {
  const saved=state.pool.find(i=>i.id===imageId);
  if(!saved)throw new CowriterError("Image not found.",404);
  const {data,error}=await client.rpc("funny_catalog_image",{p_id:imageId,p_session:state.id});
  // Retirement removes images from new retrieval, while an owned saved draft may retain its original asset.
  if(error||!data||data.storage_path!==saved.storage_path||!catalogAsset(data.storage_path))throw new CowriterError("This draft's original image is unavailable.",404);
  return data as {storage_path:string;available:boolean;width:number;height:number};
}
type Progress = (stage:string)=>void;
type Context = Awaited<ReturnType<typeof context>>;

async function createDraft(input:DraftInput,ctx:Context,state:State,signal:AbortSignal,progress:Progress,timings:Timing[]) {
  const apiKey=process.env.GEMINI_API_KEY;if(!apiKey)throw new CowriterError("The writer is temporarily unavailable.",503);
  let image:Buffer|undefined;let dimensions={width:960,height:720};
  if(input.mode==="pic"){
    image=await imageBytes(ctx.client,{...state,input},"upload");
    const sharp=(await import("sharp")).default;const metadata=await sharp(image).metadata();dimensions={width:metadata.width??960,height:metadata.height??720};
  }
  const {intent,pool,options}=await writeDraft({input,image,apiKey,signal,runtime:state.runtime??DEFAULT_RUNTIME,onStage:progress,onTiming:t=>timings.push(t),retrieve:async(vectors,queries,requestSignal)=>{
    const {data,error}=await ctx.client.rpc("cowriter_search",{p_vectors:vectors,p_queries:queries,p_version:INDEX_VERSION}).abortSignal(requestSignal);
    if(error)throw new CowriterError("Image search could not finish. Please try again.",503);
    return (data??[]) as CatalogImage[];
  }});
  return {...state,input,intent,pool,options:options.map(o=>{
    const img=pool.find(i=>i.id===o.image_id);return {...o,id:randomUUID(),alt:img?.description??intent.visual_anchors.join(". "),width:img?.width??dimensions.width,height:img?.height??dimensions.height};
  }),...(options.length<3?{notice:`${options.length} complete ${options.length===1?'option':'options'} made it through. Try again for more.`}:{notice:undefined})} as State;
}
async function editDraft(edit:Edit,ctx:Context,state:State,signal:AbortSignal,progress:Progress,timings:Timing[]) {
  const current=state.options.find(o=>o.id===edit.optionId);if(!current)throw new CowriterError("That option is no longer available.",409);
  if(edit.operation==="undo"){
    const revision=(state.undo_cursor??state.revision)-1;
    if(revision<1)throw new CowriterError("There is no earlier edit to restore.",400);
    const previous=await readState(ctx.client,state.id,revision);
    // Restore the prior whole draft; the new revision remains monotonic for race protection.
    return {...previous,id:state.id,revision:state.revision,runtime:state.runtime??previous.runtime,undo_cursor:revision};
  }
  if(edit.operation==="manual")return {...state,undo_cursor:undefined,options:state.options.map(o=>o.id===current.id?{...o,caption:edit.caption!}:o)};
  const boundError=lengthEditError(edit.operation,current.caption);
  if(boundError)throw new CowriterError(boundError,400);
  const apiKey=process.env.GEMINI_API_KEY;if(!apiKey)throw new CowriterError("The writer is temporarily unavailable.",503);
  let selected=state.pool.find(i=>i.id===current.image_id);
  if(edit.operation==="swap"){
    if(state.input.mode!=="thought")throw new CowriterError("Your uploaded picture stays fixed.",400);
    selected=state.pool.find(i=>i.id===edit.imageId);
    if(!selected)throw new CowriterError("Choose an image from this draft's shortlist.",400);
    const live=await catalogImage(ctx.client,state,selected.id);
    if(!live.available)throw new CowriterError("This library image was retired. Choose another image.",409);
  }
  const imageId=selected?.id??"upload";
  progress(edit.operation==="swap"?"Adapting the caption to this image":"Refining your selected take");
  const image=state.input.mode==="pic"?await imageBytes(ctx.client,state,"upload"):undefined;
  const runtime=state.runtime??DEFAULT_RUNTIME;
  const prompt=editPrompt(state.input,state.intent,{...current,image_id:imageId},edit.operation,selected,runtime.taste);
  const output=await withCleanAngle(clean=>
    generate(clean ? prompt+"\n"+CLEAN_ANGLE : prompt,generatedOptionSchema,apiKey,signal,image,t=>timings.push(t),clean?edit.operation+"_clean":edit.operation,fetch,runtime.model),signal);
  if(output.image_id!==imageId)throw new CowriterError("The writer tried to change the image. Your previous take is safe.");
  if(!keepsLiterals(output.caption,state.input.locks))throw new CowriterError("The writer missed a phrase you wanted to keep. Your previous take is safe.");
  const directionError=lengthEditError(edit.operation,current.caption,output.caption);
  if(directionError)throw new CowriterError(directionError);
  return {...state,notice:undefined,undo_cursor:undefined,options:state.options.map(o=>o.id===current.id?{...o,...output,alt:selected?.description??o.alt,width:selected?.width??o.width,height:selected?.height??o.height}:o)};
}
export async function runAction(request:Request,body:{requestId:string;input:DraftInput}|Edit) {
  const ctx=await context(request);
  const isDraft="input" in body;const action=isDraft?"draft":body.operation;
  const fingerprint=createHash("sha256").update(JSON.stringify(body)).digest("hex");
  const {data:claim,error}=await ctx.client.rpc("cowriter_begin",{p_key:ctx.key,p_request:body.requestId,p_action:action,p_fingerprint:fingerprint,p_session:isDraft?null:body.sessionId,p_revision:isDraft?0:body.revision,p_input:isDraft?inputSchema.parse(body.input):{}});
  if(error)throw new CowriterError(/allowance|running|changed|paused|reused|attempt/.test(error.message)?error.message:"This request could not start.",error.code==="54000"?429:error.code==="42501"?403:409);
  if(claim.cached)return json({state:claim.state});
  const start=Date.now();const timings:Timing[]=[];
  const cancelled=new AbortController();
  const signal=AbortSignal.any([request.signal,cancelled.signal,AbortSignal.timeout(15000)]);
  let runtime=claim.state.runtime??DEFAULT_RUNTIME;
  let closed=false;
  const stream=new ReadableStream<Uint8Array>({
    async start(controller){
      const send=(value:unknown)=>{if(!closed){try{controller.enqueue(new TextEncoder().encode(JSON.stringify(value)+"\n"));}catch{closed=true;}}};
      try{
        if(isDraft && !body.input.tasteVersion){
          const {data,error}=await ctx.client.rpc("funny_runtime").abortSignal(signal);
          const parsed=runtimeSchema.safeParse(data);
          if(error||!parsed.success)throw new CowriterError("The writing configuration is temporarily unavailable. Please try again.",503);
          runtime=parsed.data;
        }else {
          runtime=runtimeSchema.parse(runtime);
          if(isDraft && runtime.taste?.version!==body.input.tasteVersion)throw new CowriterError("The joke taste could not be loaded. Refresh the lab and try again.",409);
        }
        const working={...claim.state,runtime};
        const next=isDraft?await createDraft(body.input,ctx,working,signal,s=>send({stage:s}),timings):await editDraft(body,ctx,working,signal,s=>send({stage:s}),timings);
        signal.throwIfAborted();send({stage:"Saving your complete takes"});
        const {data:state,error:saveError}=await ctx.client.rpc("cowriter_finish",{p_key:ctx.key,p_request:body.requestId,p_token:claim.token,p_state:next,p_metrics:{elapsed_ms:Date.now()-start,timings,model:runtime.model,config_version:runtime.config_version,prompt_version:VERSION,index_version:INDEX_VERSION},p_error:null});
        if(saveError||!state)throw new CowriterError("The draft changed before this result was saved. Reload your saved drafts.",409);
        send({state});
      }catch(e){
        const message=signal.aborted?"This attempt ended before it finished. Your previous results are safe.":e instanceof CowriterError?e.message:"The writer could not finish. Please try again.";
        await ctx.client.rpc("cowriter_finish",{p_key:ctx.key,p_request:body.requestId,p_token:claim.token,p_state:null,p_metrics:{elapsed_ms:Date.now()-start,timings,model:runtime.model,config_version:runtime.config_version,prompt_version:VERSION,index_version:INDEX_VERSION},p_error:message});
        send({error:message});
      }finally{if(!closed){closed=true;controller.close();}}
    },cancel(){closed=true;cancelled.abort();},
  });
  return new Response(stream,{headers:{"Content-Type":"application/x-ndjson","Cache-Control":"private, no-store","X-Accel-Buffering":"no"}});
}

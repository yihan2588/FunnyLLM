import { z } from "zod";
import { intentSchema,validOptions,diversify,keepsLiterals,DEFAULT_RUNTIME,type RuntimeConfig,type DraftInput,type Intent,type CatalogImage } from "./contracts.ts";
import { generate,embed,CowriterError,type Timing } from "./provider.ts";
import { interpretationPrompt,composePrompt,CLEAN_ANGLE } from "./prompts.ts";
import { isWriterRefusal, WriterRefusal, withCleanAngle } from "./refusal.ts";
const wireOption=z.object({image_id:z.string(),caption:z.string(),angle:z.string(),intent_bridge:z.string(),preserve_on_edit:z.string()});
export type WorkflowOptions={input:DraftInput;image?:Buffer;apiKey:string;signal:AbortSignal;runtime?:RuntimeConfig;onStage?:(stage:string)=>void;onTiming?:(timing:Timing)=>void;
 retrieve:(vectors:number[][],queries:string[],signal:AbortSignal)=>Promise<CatalogImage[]>;
 // These switches are for offline controlled experiments, never accepted from a public request.
 queryStrategy?:'relational'|'literal';pictureStrategy?:'interpreted'|'direct';intentOverride?:Intent;request?:typeof fetch};
export async function writeDraft(options:WorkflowOptions){
 const {input,image,apiKey,signal,onStage,onTiming}=options;
 const runtime=options.runtime??DEFAULT_RUNTIME;
 let intent:Intent;
 if(options.intentOverride){intent=options.intentOverride;}
 else if(input.mode==='pic'&&options.pictureStrategy==='direct'){
  intent={target:'',spirit:input.text,explicit_constraints:input.locks?[input.locks]:[],visual_anchors:[],angles:[],search_queries:{topic:'',relationship:'',visual_analogy:''}};
 }else{
  onStage?.('Finding the funny angle');
  intent=await generate(interpretationPrompt(input,runtime.taste),intentSchema,apiKey,signal,image,onTiming,'interpret',options.request,runtime.model);
 }
 let pool:CatalogImage[]=[];
 if(input.mode==='thought'){
  onStage?.('Finding images for your thought');const start=Date.now();
  const queries=options.queryStrategy==='literal'?[input.text,input.text,input.text]:[`${input.text}\n${intent.search_queries.topic}`.slice(0,950),intent.search_queries.relationship,intent.search_queries.visual_analogy];
  const vectors=await embed(queries,apiKey,signal,'RETRIEVAL_QUERY',options.request);
  pool=diversify(await options.retrieve(vectors,queries,signal));
  onTiming?.({stage:'retrieve',elapsed_ms:Date.now()-start,outcome:'ok'});
  if(pool.length<3)throw new CowriterError('There are not enough available images for this thought. Try a different angle or upload a picture.',503);
 }
 onStage?.('Writing three different takes');
 const imageIds=input.mode==='pic'?['upload']:pool.map(i=>i.id);
 const outputOption=wireOption.extend({image_id:z.enum(imageIds as [string,...string[]])});
 const prompt=composePrompt(input,intent,pool,runtime.examples,runtime.taste);
 const schema=z.object({options:z.array(outputOption).min(1).max(3)});
 const allowed=new Set(imageIds);
 let result=await withCleanAngle(async clean=>{
  if(clean) onStage?.('Trying a clean situational angle');
  const raw=await generate(clean ? prompt+"\n"+CLEAN_ANGLE : prompt,schema,apiKey,signal,image,onTiming,clean?'compose_clean':'compose',options.request,runtime.model);
  const usable=validOptions({options:raw.options.filter(o=>!isWriterRefusal(o.caption))},allowed).filter(o=>keepsLiterals(o.caption,input.locks));
  if(!usable.length && raw.options.some(o=>isWriterRefusal(o.caption))) throw new WriterRefusal();
  return usable;
 },signal);
 if(input.mode==='thought'){const seen=new Set<string>();result=result.filter(o=>{if(seen.has(o.image_id))return false;seen.add(o.image_id);return true;});}
 if(!result.length)throw new CowriterError('None of these takes fit the caption limits and locks. Please try another angle.');
 return {intent,pool,options:result};
}

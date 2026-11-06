import { z } from "zod";
import { MODEL, EMBEDDING_MODEL, normalizeVector } from "./contracts.ts";

import { WRITER_POLICY } from "./prompts.ts";

export type Timing = { stage: string; elapsed_ms: number; usage?: unknown; outcome: string;
  request?: { system_instruction?:string; model:string; prompt:string; prompt_truncated:boolean; has_image:boolean; max_output_tokens:number; temperature:number };
  response?: unknown; http_status?: number };
export { CowriterError } from "./refusal.ts";
import { CowriterError, isWriterRefusal, WriterRefusal } from "./refusal.ts";
const TRACE_LIMIT=16000;
function boundedTrace(value:unknown) {
  const text=JSON.stringify(value);
  return text?.length>TRACE_LIMIT?{truncated:true,preview:text.slice(0,TRACE_LIMIT)}:value;
}
export async function generate<T>(prompt: string, schema: z.ZodType<T>, key: string, signal: AbortSignal, image?: Buffer,
  onTiming?: (timing: Timing) => void, stage = "compose", request: typeof fetch = fetch, model = MODEL): Promise<T> {
  const start = Date.now();
  const trace={model,system_instruction:WRITER_POLICY,prompt:prompt.slice(0,TRACE_LIMIT),prompt_truncated:prompt.length>TRACE_LIMIT,has_image:!!image,max_output_tokens:1600,temperature:1};
  let responseTrace:unknown,usage:unknown,httpStatus:number|undefined;
  try {
    const response = await request("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method:"POST", signal, headers:{"Content-Type":"application/json","x-goog-api-key":key},
      body:JSON.stringify({model,store:false,system_instruction:WRITER_POLICY, input:[{type:"text",text:prompt}, ...(image ? [{type:"image",data:image.toString("base64"),mime_type:"image/jpeg"}] : [])],
        generation_config:{max_output_tokens:1600,temperature:1}, response_format:{type:"text",mime_type:"application/json",schema:z.toJSONSchema(schema,{unrepresentable:"any"})}}),
    });
    httpStatus=response.status;
    const data = await response.json().catch(()=>null);
    if (["safety","prohibited_content","spii","blocklist","image_safety","content_blocked"].includes(data?.error?.code))
      throw new CowriterError("Try a different picture or make the joke about an everyday situation.",422);
    if (!response.ok) throw new CowriterError(response.status === 429 ? "The writer is busy. Please try again shortly." : "The writer could not finish. Please try again.",response.status===429?429:502);
    if (!data || (data.status && data.status !== "completed")) throw new CowriterError("The writer returned an incomplete result. Please try again.");
    usage=boundedTrace(data.usage);
    const raw = data.output_text ?? data.steps?.filter((s:{type:string})=>s.type==="model_output").flatMap((s:{content:unknown[]})=>s.content??[])
      .filter((p:{type:string})=>p.type==="text").map((p:{text:string})=>p.text??"").join("");
    responseTrace={raw_text:String(raw??"").slice(0,TRACE_LIMIT),truncated:String(raw??"").length>TRACE_LIMIT};
    if (typeof raw==="string" && isWriterRefusal(raw)) throw new WriterRefusal();
    const parsed=JSON.parse(raw??"");responseTrace=boundedTrace(parsed);
    if(typeof parsed?.caption==="string" && isWriterRefusal(parsed.caption)) throw new WriterRefusal();
    const result = schema.parse(parsed);
    onTiming?.({stage,elapsed_ms:Date.now()-start,usage,outcome:"ok",request:trace,response:responseTrace,http_status:httpStatus}); return result;
  } catch (e) {
    onTiming?.({stage,elapsed_ms:Date.now()-start,outcome:signal.aborted?"timeout":"error",request:trace,response:responseTrace,usage,http_status:httpStatus});
    if (signal.aborted) throw new CowriterError("This took too long. Your last results are safe; try again.",504);
    if (e instanceof CowriterError) throw e;
    throw new CowriterError("The writer returned an incomplete result. Please try again.");
  }
}
export async function embed(texts: string[], key: string, signal: AbortSignal, task = "RETRIEVAL_QUERY", request: typeof fetch = fetch) {
  const response = await request(`https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:batchEmbedContents`, {
    method:"POST",signal,headers:{"Content-Type":"application/json","x-goog-api-key":key},body:JSON.stringify({requests:texts.map(text=>({model:`models/${EMBEDDING_MODEL}`,content:{parts:[{text}]},taskType:task,outputDimensionality:768}))}),
  });
  if(!response.ok) throw new CowriterError("Image search is busy. Please try again.",503);
  const body=await response.json();
  if(body.embeddings?.length!==texts.length) throw new CowriterError("Image search is temporarily unavailable.",503);
  return body.embeddings.map((e:{values:number[]})=>normalizeVector(e.values)) as number[][];
}

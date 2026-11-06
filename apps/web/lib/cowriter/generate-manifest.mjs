// Run with Node --experimental-strip-types after changing the generation source.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {VERSION,INDEX_VERSION,MODEL,MAX_WORDS,MAX_CHARS} from './contracts.ts';
import {WRITER_POLICY,CLEAN_ANGLE,CREATIVE,interpretationPrompt,composePrompt,editPrompt} from './prompts.ts';
const files=['contracts.ts','prompts.ts','workflow.ts','provider.ts','refusal.ts'];
const sourceHash=createHash('sha256');
for(const file of files)sourceHash.update(file).update(await readFile(new URL(file,import.meta.url)));
const input={mode:'thought',text:'{{user thought}}',locks:'{{explicit locks}}'};
const intent={target:'{{target}}',spirit:'{{spirit}}',explicit_constraints:['{{explicit constraint}}'],visual_anchors:['{{visible fact}}'],angles:['{{angle 1}}','{{angle 2}}'],search_queries:{topic:'{{topic query}}',relationship:'{{relationship query}}',visual_analogy:'{{visual analogy query}}'}};
const image={id:'{{catalog image id}}',description:'{{trusted image description}}',affordances:'{{visual relationship}}',family:'{{family}}',storage_path:'{{asset}}',width:960,height:720};
const taste={label:'{{selected taste}}',prompt:'{{saved taste direction}}'};
const current={id:'{{option id}}',image_id:image.id,caption:'{{current caption}}',angle:'{{selected angle}}',intent_bridge:'{{intent connection}}',preserve_on_edit:'{{preserve}}',alt:image.description,width:960,height:720};
const operations=[['shorter','Shorter'],['longer','Longer'],['less_obvious','Less obvious'],['more_obvious','More obvious'],['less_mean','Less mean'],['more_mean','More mean'],['new_angle','Different angle'],['swap','Swap image']];
const manifest={version:VERSION,indexVersion:INDEX_VERSION,defaultModel:MODEL,maxWords:MAX_WORDS,maxCharacters:MAX_CHARS,sourceFiles:files,sourceHash:sourceHash.digest('hex'),
 generationCalls:{draft:2,refinement:1,maxCleanRewrites:1},
 steps:[{id:'interpret',title:'Interpret',purpose:'Find the target, spirit, visual facts and comic tensions. This is one multimodal model call.'},{id:'retrieve',title:'Retrieve images',purpose:'Thought mode only: one embedding batch, exact cosine and full-text search, then eight distinct image families. Picture mode keeps the uploaded image.'},{id:'compose',title:'Compose',purpose:'One model call writes three complete image-caption options. New drafts use the selected model and up to three enabled reference examples.'},{id:'validate',title:'Validate and save',purpose:'Code checks image IDs, distinct options, caption bounds, literal locks and ownership before saving a revision.'}],
 prompts:{policy:WRITER_POLICY,cleanRewrite:CLEAN_ANGLE,creative:CREATIVE,interpretation:interpretationPrompt(input,taste),composition:composePrompt(input,intent,[image],[],taste),refinements:operations.map(([operation,label])=>({operation,label,prompt:editPrompt(input,intent,current,operation,image,taste)}))},
 notes:['Placeholders show where per-request data is inserted. They are not a request trace.','The workflow is source-versioned. Admin model/example changes affect new drafts; existing drafts retain their saved model/example configuration.','A caption refusal can trigger one clean situational rewrite within the same deadline. Provider blocks are surfaced directly.']};
await writeFile(new URL('workflow-manifest.json',import.meta.url),JSON.stringify(manifest,null,2)+'\n');
process.stdout.write(`Generated ${VERSION} manifest (${manifest.sourceHash.slice(0,12)}).\n`);

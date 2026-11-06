import test from 'node:test';
import assert from 'node:assert/strict';
import { adminReturn } from '../lib/admin-return.ts';
import { parseMutation, libraryFields, normalizeEmbedding, queryPage } from '../lib/funny/validation.ts';
import { probeModel } from '../lib/funny/model-probe.ts';
const id='00000000-0000-4000-8000-000000000001';
const form = values => { const f=new FormData(); for(const [k,v] of Object.entries(values)) f.set(k,v); return f; };
test('admin sign-in preserves only known app destinations and bounded filters',()=>{
 assert.equal(adminReturn('/admin/activity?id='+id),'/admin/activity?id='+id);
 assert.equal(adminReturn('/admin/library?new=1'),'/admin/library?new=1');
 assert.equal(adminReturn('/admin/content?tab=reports'),'/admin/content?tab=reports');
 for(const value of ['https://evil.test','//evil.test','/admin\\evil','/api/admin/image','/adminx','/members','/admin/unknown','/admin/history','/admin/prompts','/admin/media','/admin/media/new','/admin/cowriter']) assert.equal(adminReturn(value),'/admin');
 assert.equal(adminReturn('/admin/people?next=https://evil.test'),'/admin/people');
});
test('admin actions are allowlisted and destructive actions require an explicit confirmation',()=>{
 assert.throws(()=>parseMutation(form({action:'grant_admin',id})),/not supported/);
 assert.throws(()=>parseMutation(form({action:'post_remove',id,reason:'Spam posting'})),/Confirm/);
 assert.deepEqual(parseMutation(form({action:'post_remove',id,reason:'Spam posting',confirm:'on'})),{action:'post_remove',id,data:{reason:'Spam posting'}});
 assert.throws(()=>parseMutation(form({action:'model_activate',id:'bad'})),/invalid/);
 assert.deepEqual(parseMutation(form({action:'writing_enabled',enabled:'false'})).data,{enabled:false});
});
test('example captions enforce actual runtime length and supported glyph constraints',()=>{
 const data={action:'example_save',intent:'Stalling on a task',image_description:'An empty office desk',caption:'Research phase.',enabled:'on'};
 assert.equal(parseMutation(form(data)).data.enabled,true);
 assert.throws(()=>parseMutation(form({...data,caption:'word '.repeat(21)})),/20 words/);
 assert.throws(()=>parseMutation(form({...data,caption:'Doing great 😀'})),/font/);
 assert.throws(()=>parseMutation(form({...data,caption:'One\nTwo'})),/single caption/);
 assert.equal(parseMutation(form({...data,caption:'word '.repeat(20).trim()})).data.caption.split(' ').length,20);
});
test('model and library fields cannot set arbitrary API endpoints or malformed search vectors',()=>{
 assert.throws(()=>parseMutation(form({action:'model_save',label:'bad',model_id:'https://attacker.test'})),/Gemini model/);
 assert.equal(parseMutation(form({action:'model_save',label:'Flash',model_id:'gemini-3.1-flash-lite',enabled:'on'})).data.model_id,'gemini-3.1-flash-lite');
 assert.throws(()=>libraryFields(form({description:'',affordances:''})),/description/);
 assert.throws(()=>normalizeEmbedding([1,2]),/invalid vector/);
 assert.throws(()=>normalizeEmbedding(Array(768).fill(0)),/empty/);
 const v=Array(768).fill(0);v[0]=4;assert.equal(normalizeEmbedding(v)[0],1);
 assert.equal(queryPage('Infinity'),1);assert.equal(queryPage('999999'),10000);
});
test('model activation probe checks structured response and never includes provider error bodies',async()=>{
 let sent;
 await probeModel('gemini-3.1-flash-lite','private-key',async(url,options)=>{assert.equal(url,'https://generativelanguage.googleapis.com/v1beta/interactions');sent=JSON.parse(options.body);return Response.json({output_text:'{"ok":true}'});});
 assert.equal(sent.store,false);assert.equal(sent.model,'gemini-3.1-flash-lite');assert.doesNotMatch(JSON.stringify(sent),/private-key/);
 await assert.rejects(probeModel('gemini-missing','private-key',async()=>new Response('private-key secret provider output',{status:403})),e=>{assert.match(e.message,/unchanged/);assert.doesNotMatch(e.message,/private-key|secret provider/);return true;});
 await assert.rejects(probeModel('gemini-missing','x',async()=>Response.json({output_text:'{"ok":false}'})),/unchanged/);
});

test('taste mutations accept one standard emoji, bounded fields and confirmed deletion',()=>{
 const f=new FormData();Object.entries({action:'taste_save',emoji:'👩🏽‍🚀',label:'Spacey',prompt:'Pick an unexpected orbit.'}).forEach(([k,v])=>f.set(k,v));
 assert.equal(parseMutation(f).data.emoji,'👩🏽‍🚀');
 for(const bad of ['lol', '😊😊','4']){f.set('emoji',bad);assert.throws(()=>parseMutation(f),/one standard emoji/);}
 f.set('action','taste_delete');f.set('id','00000000-0000-4000-8000-000000000001');
 assert.throws(()=>parseMutation(f),/Confirm/);f.set('confirm','on');assert.equal(parseMutation(f).action,'taste_delete');
});

"use client";
import { useEffect,useRef,useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { captionSchema,wordCount,MAX_WORDS,MAX_CHARS,type State,type TasteMenuItem,type Option,type Edit } from "@/lib/cowriter/contracts";
import { MemePreview } from "@/app/meme-preview";
import { prepareUploadImage } from "@/lib/upload-image";

type DraftSummary={id:string;revision:number;input:{mode:string;text:string};updated_at:string};
const controls=[{label:'Length',less:'shorter',lessLabel:'Shorter',more:'longer',moreLabel:'Longer'},{label:'Clarity',less:'less_obvious',lessLabel:'Less obvious',more:'more_obvious',moreLabel:'More obvious'},{label:'Bite',less:'less_mean',lessLabel:'Less mean',more:'more_mean',moreLabel:'More mean'}] as const;

export function Cowriter({signedIn,initialMode,initialDraft,tastes,menuUnavailable,initialTaste}:{tastes:TasteMenuItem[];menuUnavailable:boolean;initialTaste?:string;signedIn:boolean;initialMode:'pic'|'thought';initialDraft?:string}){
 const router=useRouter();
 const [choice,setChoice]=useState(initialTaste??tastes[0]?.version);
 const taste=tastes.find(t=>t.version===choice)??tastes[0];
 const [mode,setMode]=useState(initialMode),[thought,setThought]=useState(''),[spirit,setSpirit]=useState(''),[locks,setLocks]=useState('');
 const [file,setFile]=useState<File|null>(null),[preview,setPreview]=useState(''),[uploadPath,setUploadPath]=useState('');
 const [state,setState]=useState<State|null>(null),[selected,setSelected]=useState(''),[wording,setWording]=useState('');
 const [busy,setBusy]=useState(false),[stage,setStage]=useState(''),[slow,setSlow]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [showPublish,setShowPublish]=useState(false),[authorName,setAuthorName]=useState('Community member'),[publishedId,setPublishedId]=useState('');
 const [publishing,setPublishing]=useState(false),[publishError,setPublishError]=useState('');
 const publishDialog=useRef<HTMLDialogElement>(null),publishTrigger=useRef<HTMLButtonElement>(null);
 const [swapping,setSwapping]=useState(false),[drafts,setDrafts]=useState<DraftSummary[]>([]),[showDrafts,setShowDrafts]=useState(false),[loadingDrafts,setLoadingDrafts]=useState(false);
 const abort=useRef<AbortController|null>(null),serial=useRef(0),resultRef=useRef<HTMLHeadingElement>(null),fileRef=useRef<HTMLInputElement>(null);
 const current=state?.options.find(o=>o.id===selected)??state?.options[0];
 const dirty=!!current&&wording!==current.caption;
 const wordingCheck=captionSchema.safeParse(wording);
 useEffect(()=>{
  if(!showPublish)return;
  const dialog=publishDialog.current,trigger=publishTrigger.current;
  const overflow=document.body.style.overflow;
  dialog?.showModal();document.body.style.overflow='hidden';
  return()=>{dialog?.close();document.body.style.overflow=overflow;trigger?.focus({preventScroll:true});};
 },[showPublish]);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
 useEffect(()=>{if(!busy)return;const timer=setTimeout(()=>setSlow(true),8000);return()=>clearTimeout(timer);},[busy]);
 useEffect(()=>()=>{serial.current++;abort.current?.abort();},[]);
 useEffect(()=>{if(initialDraft&&signedIn){void loadDraft(initialDraft);} // The initial URL is consumed once; subsequent changes use explicit actions.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 function applyState(next:State){setState(next);const option=next.options.find(o=>o.id===selected)??next.options[0];setSelected(option.id);setWording(option.caption);setSwapping(false);setPublishedId('');setPublishedId('');window.history.replaceState({},'',`/lab?mode=${next.input.mode}&draft=${next.id}`);}
 function imageUrl(option:Option){return `/api/cowriter/image?session=${state!.id}&image=${encodeURIComponent(option.image_id)}`;}
 async function loadDraft(draftId:string){await attempt(async(controller,id)=>{setStage('Opening your saved draft');const r=await fetch(`/api/cowriter/session?id=${encodeURIComponent(draftId)}`,{cache:'no-store',signal:controller.signal});const b=await r.json();if(!r.ok)throw new Error(b.error);if(id!==serial.current)return;applyState(b.state);setChoice(b.state.input.tasteVersion);setMode(b.state.input.mode);setFile(null);setPreview('');setUploadPath(b.state.input.mode==='pic'?b.state.input.uploadPath:'');if(b.state.input.mode==='pic')setSpirit(b.state.input.text);else setThought(b.state.input.text);setLocks(b.state.input.locks);setShowDrafts(false);});}
 async function savedDrafts(){setShowDrafts(v=>!v);if(showDrafts)return;setLoadingDrafts(true);try{const r=await fetch('/api/cowriter/session',{cache:'no-store'});const b=await r.json();if(!r.ok)throw new Error(b.error);setDrafts(b.drafts);}catch(e){setError(e instanceof Error?e.message:'Drafts could not be loaded.');}finally{setLoadingDrafts(false);}}
 async function stream(path:string,body:unknown,controller:AbortController,id:number){
  const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
  if(response.headers.get('content-type')?.includes('application/json')){const data=await response.json();if(data.error){if(response.status===409 && data.error.includes("joke taste changed"))router.refresh();throw new Error(data.error);}if(data.state&&id===serial.current)applyState(data.state);return;}
  if(!response.ok||!response.body)throw new Error('The writer could not be reached. Please try again.');
  const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',complete=false;
  while(true){const {done,value}=await reader.read();buffer+=decoder.decode(value,{stream:!done});const lines=buffer.split('\n');buffer=lines.pop()??'';
   for(const line of lines){if(!line.trim())continue;const event=JSON.parse(line);if(id!==serial.current)continue;if(event.error)throw new Error(event.error);if(event.stage)setStage(event.stage);if(event.state){applyState(event.state);complete=true;}}
   if(done)break;
  }
  if(!complete&&id===serial.current)throw new Error('The connection ended early. Your saved drafts may contain the result.');
 }
 async function attempt(work:(controller:AbortController,id:number)=>Promise<void>){
  abort.current?.abort();const controller=new AbortController();abort.current=controller;const id=++serial.current;setSlow(false);setStage('Starting your request');setBusy(true);setError('');setNotice('');
  try{await work(controller,id);if(id===serial.current){setTimeout(()=>resultRef.current?.focus(),0);}}
  catch(e){if(id===serial.current&&!controller.signal.aborted)setError(e instanceof Error?e.message:'Something interrupted this attempt.');}
  finally{if(id===serial.current){setBusy(false);abort.current=null;}}
 }
 async function draft(event:React.FormEvent){event.preventDefault();if(!signedIn)return;
  await attempt(async(controller,id)=>{let path=uploadPath;
   if(mode==='pic'&&!path){if(!file)throw new Error('Choose a picture first.');setStage('Preparing your picture');const prepared=await prepareUploadImage(file);setStage('Saving your private picture');const form=new FormData();form.set('photo',prepared);const r=await fetch('/api/cowriter/upload',{method:'POST',body:form,signal:controller.signal});const b=await r.json();if(!r.ok)throw new Error(b.error);path=b.path;if(id===serial.current)setUploadPath(path);}
   await stream('/api/cowriter/draft',{requestId:crypto.randomUUID(),input:{...(mode==='pic'?{mode,text:spirit,locks,uploadPath:path}:{mode,text:thought,locks}),tasteVersion:taste?.version}},controller,id);
  });
 }
 async function refine(operation:Edit['operation'],imageId?:string){if(!state||!current)return;
  if(operation==='manual'){const parsed=captionSchema.safeParse(wording);if(!parsed.success){setError(parsed.error.issues[0]?.message??'Check the caption.');return;}}
  await attempt((controller,id)=>stream('/api/cowriter/refine',{requestId:crypto.randomUUID(),sessionId:state.id,revision:state.revision,optionId:current.id,operation,...(operation==='manual'?{caption:wording}:{}),...(imageId?{imageId}:{})},controller,id));
 }
 function cancel(){serial.current++;abort.current?.abort();abort.current=null;setBusy(false);setNotice('Stopped. Your last complete results are still here.');}
 async function download(){if(!state||!current)return;await attempt(async(controller)=>{
  setStage('Making your PNG');const r=await fetch('/api/cowriter/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:state.id,optionId:current.id,revision:state.revision}),signal:controller.signal});
  if(!r.ok)throw new Error((await r.json()).error);const url=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=url;a.download='funnyllm-meme.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('Your captioned meme is ready.');
 });}
 async function publish(event:React.FormEvent){
  event.preventDefault();if(!state||!current||dirty||publishing)return;
  setPublishing(true);setPublishError('');
  try{
   const r=await fetch('/api/gallery/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:state.id,revision:state.revision,optionId:current.id,authorName:authorName.trim()})});
   const data=await r.json();if(!r.ok)throw new Error(data.error??'This take could not be shared.');
   if(data.status!=='published')throw new Error(data.status==='removed'?'This take was removed by an admin and cannot be shared again.':'This take is already in My creations. You can publish it again there.');
   setPublishedId(data.postId);
  }catch(e){setPublishError(e instanceof Error?e.message:'This take could not be shared. Please try again.');}
  finally{setPublishing(false);}
 }
 async function feedback(reason:string){if(!state||!current)return;try{const r=await fetch('/api/cowriter/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:state.id,revision:state.revision,optionId:current.id,reason})});if(!r.ok)throw new Error();setNotice('Feedback saved. Thank you.');}catch{setError('Feedback could not be saved. Please try again.');}}
 return <>
  <section className="cw-intro"><div><h1>Funny Lab</h1><p>A picture. A thought. Three takes to make your own.</p></div>{signedIn&&<button className="cw-secondary" onClick={savedDrafts} disabled={busy} aria-expanded={showDrafts}>Saved drafts</button>}</section>
  {showDrafts&&<section className="cw-drafts" aria-label="Saved drafts">{loadingDrafts?<p>Loading your drafts…</p>:drafts.length?<ul>{drafts.map(d=><li key={d.id}><button onClick={()=>loadDraft(d.id)} disabled={busy}>{d.input.text||'A picture with a funny side'}<span>{d.input.mode==='pic'?'Picture':'Thought'} / {new Date(d.updated_at).toLocaleDateString()}</span></button></li>)}</ul>:<p>Your complete drafts will appear here.</p>}</section>}
  <section className="cw-compose" aria-label="Create a meme"><form onSubmit={draft}>
   <fieldset className="cw-modes" disabled={busy}><legend className="cw-sr">Start with</legend>{(['pic','thought'] as const).map(m=><label key={m}><input type="radio" name="mode" value={m} checked={mode===m} onChange={()=>{setMode(m);window.history.replaceState({},'',`/lab?mode=${m}${state?'&draft='+state.id:''}`);}}/><span>{m==='pic'?'I have a pic':'I have a thought'}</span></label>)}</fieldset>
   <div className={`cw-inputs cw-inputs-${mode}`}>
   {mode==='pic'&&<div className="cw-upload"><input ref={fileRef} className="cw-sr" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose a picture" disabled={busy} onChange={e=>{const chosen=e.target.files?.[0]??null;setFile(chosen);setPreview(chosen?URL.createObjectURL(chosen):'');setUploadPath('');setError('');}}/>{(preview||(state?.input.mode==='pic'&&uploadPath))?<><Image src={preview||`/api/cowriter/image?session=${state!.id}&image=upload`} alt="Your selected picture" width={500} height={300} unoptimized/><button type="button" className="cw-secondary" onClick={()=>fileRef.current?.click()} disabled={busy}>Change picture</button></>:<button type="button" className="cw-upload-button" onClick={()=>fileRef.current?.click()} disabled={busy}><span className="cw-upload-mark" aria-hidden="true">+</span><strong>Choose your picture</strong><span>JPEG, PNG or WebP</span></button>}</div>}
   <div className="cw-direction"><label htmlFor="cw-thought">{mode==='pic'?"What's funny about it?":"What's on your mind?"}{mode==='pic'&&<span> Optional</span>}</label><textarea id="cw-thought" maxLength={700} value={mode==='pic'?spirit:thought} onChange={e=>mode==='pic'?setSpirit(e.target.value):setThought(e.target.value)} disabled={busy} required={mode==='thought'} minLength={mode==='thought'?3:undefined} placeholder={mode==='pic'?'The confidence of someone who did none of the work.':'Me organizing my to-do list instead of doing anything.'}/><p className="cw-hint">{mode==='pic'?'Give us the spirit. The image can speak for itself.':'A person, a situation, a tiny contradiction. We’ll find the picture.'}</p><details className="cw-locks"><summary>Anything to keep exactly?</summary><label htmlFor="cw-locks">Names, phrases, or audience constraints (quote exact phrases)</label><input id="cw-locks" value={locks} onChange={e=>setLocks(e.target.value)} maxLength={240} disabled={busy} placeholder='For example: Keep “Monday.”'/></details></div>
   </div>
   {tastes.length>0 && <fieldset className="cw-tastes" disabled={busy}>
    <legend>Joke taste</legend>
    <div className="cw-taste-bar">{tastes.map(item=><label key={item.version}>
     <input className="cw-sr" type="radio" name="taste" checked={taste?.version===item.version} onChange={()=>setChoice(item.version)} value={item.version}/>
     <span className="cw-taste-tile"><span aria-hidden="true" className="cw-taste-emoji">{item.emoji}</span>{item.label}</span>
    </label>)}</div>
   </fieldset>}
   {menuUnavailable && <p className="cw-hint" role="status">Joke tastes are unavailable. You can still write a draft.</p>}
   <div className="cw-start">{signedIn?<button className="cw-primary" disabled={busy||(mode==='pic' ? !file&&!uploadPath : thought.trim().length<3)}>{state?'Write three new takes':'Write three takes'}</button>:<Link className="cw-primary" href={` /login?next=${encodeURIComponent('/lab?mode='+mode+(taste?'&taste='+taste.version:''))}`.trim()}>Sign in to start</Link>}<span>Private until you choose to share.</span></div>
  </form></section>
  <div className="cw-status" aria-live="polite" aria-atomic="true">{busy&&<><p>{slow?'Still working. Good timing takes a moment.':stage}</p><button className="cw-secondary" onClick={cancel}>Cancel</button></>}{notice&&!busy&&<p>{notice}</p>}</div>
  {error&&<div className="cw-error" role="alert"><p>{error}</p><button className="cw-link" onClick={()=>setError('')}>Dismiss</button></div>}
  {busy&&!state&&<div className="cw-options cw-skeletons" aria-hidden="true">{[0,1,2].map(i=><div className="cw-skeleton" key={i}><span>A different take is on its way.</span></div>)}</div>}
  {state&&<section className="cw-results" aria-label="Your meme options"><div className="cw-result-heading"><h2 ref={resultRef} tabIndex={-1}>{state.options.length===1?"Make this take yours.":"Which one feels like you?"}</h2><p>{state.options.length===1?"Edit this take, or write three fresh ones.":"Pick a take to make it yours."}</p></div>{state.runtime?.taste && <p className="cw-hint">Draft taste · {state.runtime.taste.emoji} {state.runtime.taste.label}</p>}{state.notice&&<p className="cw-hint">{state.notice}</p>}<div className="cw-options">{state.options.map((option,i)=><button key={option.id} className="cw-option" aria-pressed={current?.id===option.id} aria-label={`Edit take ${i+1}: ${option.caption}`} disabled={busy||dirty} onClick={()=>{setSelected(option.id);setWording(option.caption);setSwapping(false);setPublishedId('');}}><MemePreview option={option} url={imageUrl(option)}/><span className="cw-option-label">Take {i+1}<span>{current?.id===option.id?'Selected':'Make it yours'}</span></span></button>)}</div>
  {current&&<section className="cw-editor" aria-label="Refine selected take"><div><h3>Your finishing touch.</h3><label htmlFor="cw-caption">Caption</label><textarea id="cw-caption" value={wording} onChange={e=>setWording(e.target.value)} disabled={busy} maxLength={MAX_CHARS} rows={3}/><div className="cw-caption-meta"><span>{wordCount(wording)} / {MAX_WORDS} words</span><span>{wording.length} / {MAX_CHARS} characters</span></div>{dirty&&<div className="cw-edit-actions"><button className="cw-secondary" onClick={()=>refine('manual')} disabled={busy||!wordingCheck.success}>Save wording</button><button className="cw-link" onClick={()=>setWording(current.caption)} disabled={busy}>Discard edit</button><p>{!wordingCheck.success?wordingCheck.error.issues[0]?.message:'Save your wording before refining, sharing or downloading.'}</p></div>}<div className="cw-refinements"><div className="cw-funny-controls" aria-label="Funny controls">{controls.map(control=><div className="cw-control-row" key={control.label}><span>{control.label}</span><div role="group" aria-label={control.label}><button className="cw-secondary" onClick={()=>refine(control.less)} disabled={busy||dirty||(control.less==='shorter'&&wordCount(current.caption)<=1)}><span aria-hidden="true">−</span> {control.lessLabel}</button><button className="cw-secondary" onClick={()=>refine(control.more)} disabled={busy||dirty||(control.more==='longer'&&wordCount(current.caption)>=MAX_WORDS)}><span aria-hidden="true">+</span> {control.moreLabel}</button></div></div>)}<p className="cw-hint">One adjustment per click. Length stops at {MAX_WORDS} words.</p></div><button className="cw-secondary" onClick={()=>refine('new_angle')} disabled={busy||dirty}>Different angle</button>{state.input.mode==='thought'&&<button className="cw-secondary" aria-expanded={swapping} disabled={busy||dirty} onClick={()=>setSwapping(v=>!v)}>Swap image</button>}<button className="cw-link" disabled={busy||dirty||(state.undo_cursor??state.revision)<2} onClick={()=>refine('undo')}>Undo last edit</button></div></div><div className="cw-finish"><p>Your joke. Your finishing touch.</p><button className="cw-primary" disabled={busy||dirty} ref={publishTrigger} onClick={()=>{setPublishError('');setShowPublish(true);}} aria-haspopup="dialog">Publish to gallery</button><button className="cw-secondary" disabled={busy||dirty} onClick={download}>Download meme</button><small className="cw-hint">Completed takes are saved automatically in My creations. Save wording to keep manual edits.</small><details><summary>Something didn’t land?</summary><div className="cw-feedback">{[['too_literal','Too literal'],['wordy','Too wordy'],['familiar','Too familiar'],['no_connection','Doesn’t connect']].map(([reason,label])=><button className="cw-link" key={reason} disabled={busy} onClick={()=>feedback(reason)}>{label}</button>)}</div></details></div></section>}
  {publishedId&&<p className="cw-published" role="status"><Link className="cw-secondary" href={`/meme/${publishedId}`}>View your shared meme</Link><Link className="cw-link" href="/creations?tab=shared">Manage shared memes</Link></p>}
  {showPublish&&current&&<dialog ref={publishDialog} className="cw-publish" aria-labelledby="publish-title" onCancel={event=>{event.preventDefault();if(!publishing)setShowPublish(false);}}>
   <h3 id="publish-title">{publishedId?'Your meme is in the gallery.':'Ready for the gallery?'}</h3>
   <div className="cw-publish-preview"><MemePreview option={current} url={imageUrl(current)}/></div>
   {publishedId?<div className="cw-publish-success" role="status"><p>Published. Your prompt and other takes stay private.</p><Link className="cw-primary" href={`/meme/${publishedId}`}>View your shared meme</Link><button type="button" className="cw-secondary" onClick={()=>setShowPublish(false)}>Back to editing</button></div>:<>
    <p>The selected image, caption and display name become public. Others can save, download and remix your meme.</p>
    <form onSubmit={publish} aria-busy={publishing}>
     <label htmlFor="publish-author">Public display name</label><input id="publish-author" value={authorName} onChange={e=>setAuthorName(e.target.value)} minLength={1} maxLength={40} required disabled={publishing} autoFocus aria-describedby="publish-name-hint"/>
     <p id="publish-name-hint" className="cw-hint">Use a name or alias you want everyone to see.</p>
     {publishError&&<p className="cw-error" role="alert">{publishError}</p>}
     <p role="status">{publishing?'Publishing your meme…':''}</p>
     <div><button className="cw-primary" disabled={publishing||dirty||!authorName.trim()}>Publish this take</button><button className="cw-secondary" type="button" onClick={()=>setShowPublish(false)} disabled={publishing}>Cancel</button></div>
    </form>
   </>}
  </dialog>}
  {swapping&&<section className="cw-swap" aria-label="Alternative images"><h3>Same thought. A different picture.</h3><p>The caption will adapt to the image you choose.</p><div className="cw-swap-grid">{state.pool.filter(i=>i.id!==current?.image_id).map(img=><button key={img.id} onClick={()=>refine('swap',img.id)} disabled={busy||dirty}><Image src={`/api/cowriter/image?session=${state.id}&image=${img.id}`} alt={img.description.slice(0,220)} width={img.width} height={img.height} unoptimized/><span>Try this image</span></button>)}</div></section>}
  </section>}
  <noscript><p className="cw-error">Enable JavaScript to upload, write, and edit your meme.</p></noscript>
 </>;
}

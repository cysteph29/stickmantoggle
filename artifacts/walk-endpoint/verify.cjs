const {chromium}=require('/Users/cyrilstephen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
const baseline=JSON.parse(fs.readFileSync('artifacts/walk-intro/before.json'));
await p.goto('http://127.0.0.1:5175/');
await p.evaluate(async()=>{const {createPushTimeline}=await import('/src/toggle/pushTimeline.ts');window.review=createPushTimeline(document.querySelector('svg'),()=>{}).pause();});
let defaultMismatches=0;
for(const row of baseline.frames){const actual=await p.evaluate(t=>{review.time(t,false);return {svg:document.querySelector('svg').outerHTML,theme:document.documentElement.getAttribute('style')}},row.t);if(actual.svg!==row.svg||actual.theme!==row.theme)defaultMismatches++;}
console.log({defaultSamples:baseline.frames.length,defaultMismatches});
await p.goto('http://127.0.0.1:5175/?intro=walk');
await p.evaluate(async()=>{
 const {createWalkPushTimeline}=await import('/src/toggle/walkPush.ts');window.review=createWalkPushTimeline(document.querySelector('svg'),()=>{}).pause();document.querySelector('#walk-actor').setAttribute('opacity','1');
});
let characterMismatches=0,characterSamples=0;let tailMismatches=0,tailSamples=0;const release=[];
for(const row of baseline.frames){
const actual=await p.evaluate(t=>{review.time(t,false);const svg=document.querySelector('svg').cloneNode(true);svg.querySelector('defs').remove();const actor=svg.querySelector('#walk-actor');actor.replaceWith(...actor.childNodes);return {svg:svg.outerHTML,theme:document.documentElement.getAttribute('style'),hip:document.querySelector('#character-root').getAttribute('transform'),knob:Number(document.querySelector('#knob').getAttribute('cx'))}},row.t);
if(row.t>=4.67){characterSamples++;if(actual.svg.slice(actual.svg.indexOf('<g id="character-root"'))!==row.svg.slice(row.svg.indexOf('<g id="character-root"')))characterMismatches++;}
if(row.t>=4.75){tailSamples++;if(actual.svg!==row.svg||actual.theme!==row.theme)tailMismatches++;}
if(row.t>=4.4&&row.t<=5.6)release.push({t:row.t,...actual,svg:undefined});
}
console.log({tailSamples,tailMismatches,characterSamples,characterMismatches});
fs.writeFileSync('artifacts/walk-endpoint/release-samples.json',JSON.stringify(release,null,2));
await p.reload();
await p.evaluate(async()=>{const {createWalkIntro}=await import('/src/toggle/walkIntro.ts');window.review=createWalkIntro(document.querySelector('svg'),()=>{}).pause();});
const gait=await p.evaluate(async()=>{
 const {sampleWalk}=await import('/src/toggle/walkIntro.ts');const rows=[];
 for(let i=0;i<=144;i++){const t=i/120;review.time(t,false);const r=sampleWalk(t);const point=id=>{const el=document.getElementById(id);const m=el.getCTM();const p=new DOMPoint(0,0).matrixTransform(m).matrixTransform(document.querySelector('svg').getCTM().inverse());return {x:p.x-124,y:p.y}};
 rows.push({t,r,near:point('ankle-left'),far:point('ankle-right'),clip:document.querySelector('#walk-actor').getAttribute('clip-path'),theme:getComputedStyle(document.documentElement).getPropertyValue('--theme')});}return rows;});
fs.writeFileSync('artifacts/walk-endpoint/gait.json',JSON.stringify(gait));
const footError=Math.max(...gait.flatMap(v=>[['frontFoot','near'],['backFoot','far']].map(([target,point])=>Math.hypot(v.r[target+'X']-v[point].x,v.r[target+'Y']-v[point].y))));
console.log({footError,entranceLight:gait.every(v=>Number(v.theme)===0),maskRetained:gait.at(-1).clip!==null});
// Capture actual click playback through the full release, including duplicate clicks.
await p.reload();
await p.bringToFront();const cdp=await p.context().newCDPSession(p);await cdp.send('Page.enable');const captures=[];
cdp.on('Page.screencastFrame',async e=>{captures.push({data:e.data,t:e.metadata.timestamp});await cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId});});
await cdp.send('Page.startScreencast',{format:'png',everyNthFrame:1});await p.screenshot();
console.log(await p.evaluate(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('/gsap.js?')).name;const gsap=(await import(url)).default;window.testGsap=gsap;const click=()=>document.querySelector('#knob').dispatchEvent(new MouseEvent('click',{bubbles:true}));click();const a=gsap.globalTimeline.getChildren(false,true,true);click();click();const z=gsap.globalTimeline.getChildren(false,true,true);return {introSingle:a.length,introRepeated:z.length,same:a[0]===z[0]};}));
await p.waitForTimeout(1400);
console.log(await p.evaluate(()=>{const a=testGsap.globalTimeline.getChildren(false,true,true);document.querySelector('#knob').dispatchEvent(new MouseEvent('click',{bubbles:true}));const z=testGsap.globalTimeline.getChildren(false,true,true);return {pushSingle:a.length,pushRepeated:z.length,same:a[0]===z[0]};}));
await p.waitForTimeout(5500);await cdp.send('Page.stopScreencast');
fs.mkdirSync('artifacts/walk-endpoint/playback',{recursive:true});let manifest='';
for(let i=0;i<captures.length;i++){fs.writeFileSync(`artifacts/walk-endpoint/playback/${i}.png`,Buffer.from(captures[i].data,'base64'));manifest+=`file '${i}.png'\nduration ${i+1<captures.length?captures[i+1].t-captures[i].t:1/60}\n`;}
fs.writeFileSync('artifacts/walk-endpoint/playback/frames.txt',manifest);
await p.emulateMedia({reducedMotion:'reduce'});await p.reload();await p.locator('#knob').click();await p.waitForTimeout(40);console.log('reduced',await p.locator('#walk-actor').evaluate(el=>({opacity:el.getAttribute('opacity'),clip:el.getAttribute('clip-path'),knob:document.querySelector('#knob').getAttribute('cx')})));
await b.close();})();

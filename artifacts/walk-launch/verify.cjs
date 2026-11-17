const fs=require('fs'),assert=require('assert/strict');
const {chromium}=require('/Users/cyrilstephen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:'artifacts/walk-launch/video',size:{width:1440,height:900}}});
const p=await context.newPage(),out='artifacts/walk-launch/';
await p.goto('http://127.0.0.1:5175/?intro=walk');
await p.evaluate(async()=>{
window.g=(await import(performance.getEntriesByType('resource').find(e=>e.name.includes('/gsap.js?')).name)).default;
window.frames=[];
});
await p.locator('#knob').click();
await p.waitForFunction(()=>g.globalTimeline.getChildren(false,true,true).some(t=>t.labels?.rest));
await p.evaluate(()=>{
window.tl=g.globalTimeline.getChildren(false,true,true).find(t=>t.labels?.rest);
const cb=tl.eventCallback('onComplete');tl.eventCallback('onComplete',()=>{cb();window.done=true});
const tick=()=>{frames.push({t:tl.time(),root:document.getElementById('character-root').getAttribute('transform')});if(!window.done)requestAnimationFrame(tick)};tick();
});
await p.waitForFunction(()=>window.done,{},{timeout:20000});
await p.screenshot({path:out+'final-completed.png'});
const final=await p.locator('#character-root').getAttribute('transform');
await p.waitForTimeout(2000);
assert.equal(await p.locator('#character-root').getAttribute('transform'),final);
await p.screenshot({path:out+'final-hold.png'});
fs.writeFileSync(out+'normal-playback.json',JSON.stringify(await p.evaluate(()=>frames),null,2));
const video=p.video();await p.close();await video.saveAs(out+'normal-speed.webm');
const q=await browser.newPage({viewport:{width:1440,height:900}});
await q.goto('http://127.0.0.1:5175/?intro=walk');
const metrics=await q.evaluate(async()=>{
const {createPushTimeline}=await import('/src/toggle/pushTimeline.ts');
const {alternatePushRig,createWalkPushTimeline}=await import('/src/toggle/walkPush.ts');
const {WALK_OFFSET_X}=await import('/src/toggle/walkComposition.ts');
const {rigToPose}=await import('/src/toggle/pushRig.ts');
const svg=document.querySelector('svg');
let base;const source=createPushTimeline(svg,()=>{},(_,r)=>{base={...r}}).pause();
let largestError=0;
for(let t=.01;t<=10.48;t+=.01){source.time(t,false);const shifted=alternatePushRig(base,t);
for(const k of ['hipX','frontFootX','backFootX'])largestError=Math.max(largestError,Math.abs(shifted[k]-base[k]-WALK_OFFSET_X));
if(t>=4.5){const a=rigToPose(base),b=rigToPose(shifted);for(const k in a)largestError=Math.max(largestError,Math.abs(a[k]-b[k]));}}
source.kill();document.getElementById('walk-actor').setAttribute('opacity','1');
window.tl=createWalkPushTimeline(svg,()=>{}).pause();
return {offset:WALK_OFFSET_X,largestError};
});
assert(metrics.largestError<1e-9);
for(let i=0;i<=28;i++){
const t=4.37+i*.04;await q.evaluate(t=>{tl.time(t,false)},t);
await q.screenshot({path:out+`release-${String(i).padStart(2,'0')}.png`});
}
for(const [name,t] of [['catch',7.15],['final',10.48]]){
await q.evaluate(t=>{tl.time(t,false)},t);
await q.screenshot({path:out+name+'.png'});
metrics[name]=await q.evaluate(()=>{
const root=document.getElementById('character-root'),b=root.getBBox();
const x=root.transform.baseVal.consolidate().matrix.e,y=root.transform.baseVal.consolidate().matrix.f;
const head=document.getElementById('head'),pt=new DOMPoint(0,-20).matrixTransform(head.getCTM());
const knob=document.getElementById('knob'),kp=new DOMPoint(+knob.getAttribute('cx'),+knob.getAttribute('cy')).matrixTransform(knob.getCTM());
return {bounds:{left:b.x+x,right:b.x+x+b.width,top:b.y+y,bottom:b.y+y+b.height},headKnobClearance:(Math.hypot(pt.x-kp.x,pt.y-kp.y)/Math.hypot(head.getCTM().a,head.getCTM().b))-20-148,knobX:knob.getAttribute('cx'),clip:document.getElementById('walk-actor').getAttribute('clip-path')};
});
// Compare pixels with/without the original curved clip at removal and rest.
await q.evaluate(()=>document.getElementById('walk-actor').setAttribute('clip-path','url(#walk-reveal)'));
await q.screenshot({path:out+name+'-clipped.png'});
}
fs.writeFileSync(out+'metrics.json',JSON.stringify(metrics,null,2));
console.log(metrics);
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

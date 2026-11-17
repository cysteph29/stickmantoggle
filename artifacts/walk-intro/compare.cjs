const {chromium}=require('/Users/cyrilstephen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
const phase=process.argv[2];
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
await page.goto('http://127.0.0.1:5175');
const meta=await page.evaluate(async()=>{
 const layout=await import('/src/toggle/layout.ts');
 const {createPushTimeline}=await import('/src/toggle/pushTimeline.ts');
 window.review=createPushTimeline(document.querySelector('#toggle-stage'),()=>{}).pause();
 return {geometry:Object.fromEntries(Object.entries(layout).filter(([_k,v])=>typeof v!=='function')),labels:review.labels,duration:review.duration()};
});
const l=meta.labels;
const poses={'light-rest':0,'push-1':l.push1+.5,'push-2':l.push2+.5,release:l.break+.05,'landing-1':l.stumble+.3,'landing-2':l.stumble+.82,'landing-3':l.stumble+1.28,'landing-4':l.stumble+2.1,catch:l.catch+.4,'stand-up':l.stand+.6,'dark-hold':meta.duration};
const times=[...new Set([...Array.from({length:Math.ceil(meta.duration*120)},(_,i)=>i/120),...Object.values(poses),meta.duration])].sort((a,b)=>a-b);
const frames=[];
for(const t of times){
 frames.push(await page.evaluate(t=>{
 review.time(t,false);
 const svg=document.querySelector('svg');
 const clone=svg.cloneNode(true);
 const point=id=>{const m=svg.getElementById(id).getCTM();const inv=svg.getCTM().inverse();const p=new DOMPoint(0,0).matrixTransform(m).matrixTransform(inv);return {x:p.x,y:p.y}}; return {t,points:Object.fromEntries(['wrist-left','wrist-right','elbow-left','elbow-right','shoulder','ankle-left','ankle-right'].map(id=>[id,point(id)])),svg:clone.outerHTML,theme:document.documentElement.getAttribute('style'),track:svg.querySelector('#track').getAttribute('d')};
 },t));
 for(const [name,time] of Object.entries(poses)) if(t===time) await page.screenshot({path:`artifacts/walk-intro/${phase}-${name}.png`,fullPage:true});
}
fs.writeFileSync(`artifacts/walk-intro/${phase}.json`,JSON.stringify({meta,poses,frames},null,2));
console.log(JSON.stringify({meta,poses,frames:frames.length}));
await browser.close();
})();

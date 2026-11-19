const fs = require('fs');
const assert = require('assert/strict');
const { chromium } = require('/Users/cyrilstephen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const baseline=process.argv.includes('--baseline');
const results={};
for(const name of baseline?['baseline']:['default','uniform']){
 await page.goto('http://127.0.0.1:5175/'+(name==='uniform'?'?variant=uniform':''));
 await page.reload();
 await page.evaluate(async()=>{window.g=(await import(performance.getEntriesByType('resource').find(e=>e.name.includes('/gsap.js?')).name)).default});
 const state=()=>page.evaluate(()=>({nodes:[...document.querySelectorAll('#character-root, #character-root * , #knob')].map(e=>[e.id,e.getAttribute('transform'),e.getAttribute('cx')]),theme:document.documentElement.style.cssText}));
 const contacts=()=>page.evaluate(()=>Object.fromEntries(['ankle-left','ankle-right','wrist-left','wrist-right'].map(id=>{const e=document.getElementById(id);const m=document.querySelector('#track').getCTM().inverse().multiply(e.getCTM());return [id,{x:m.e,y:m.f}]})));
 const snap=async(label)=>{await page.screenshot({path:`artifacts/uniform-12/${name}-${label}.png`});return state()};
 results[name]={initial:await snap('initial')};
 await page.locator('#knob').click();
 if(name==='uniform'){await page.evaluate(()=>{g.globalTimeline.getChildren(false,true,true).find(t=>t.duration()===1.2).pause().time(0.7,false)});await snap('entrance')}
 await page.evaluate(()=>{g.globalTimeline.getChildren(false,true,true).find(t=>t.duration()===1.2).progress(1,false)});
 await page.evaluate(()=>{window.tl=g.globalTimeline.getChildren(false,true,true).find(t=>t.labels?.push2!==undefined);tl.pause().time(0,false)});
 results[name].samples=[]; results[name].contacts=[];
 for(let t=0;t<12;t+=0.1){await page.evaluate(t=>{tl.time(t,false)},t);results[name].samples.push(await state());results[name].contacts.push(await contacts())}
 if(name==='uniform'){for(const [label,t] of [['first-effort',0.95],['recovery',6.5]]){await page.evaluate(t=>{tl.time(t,false)},t);await snap(label)}}
 await page.evaluate(()=>{tl.time(tl.labels.push2+0.5,false)});
 results[name].push=await snap('strongest-push');
 await page.evaluate(()=>{tl.progress(1,false)});
 results[name].completed=await snap('completed');
 results[name].geometry=await page.evaluate(()=>({track:document.querySelector('#track').getAttribute('d'),knob:[...['cx','cy','r']].map(a=>+document.querySelector('#knob').getAttribute(a)),widths:[...document.querySelectorAll('.limb,.head,.knob,.track')].map(e=>getComputedStyle(e).strokeWidth),joints:[...document.querySelectorAll('.joint-dot')].map(e=>getComputedStyle(e).r)}));
}
fs.writeFileSync(`artifacts/uniform-12/${baseline?'baseline':'results'}.json`,JSON.stringify(results,null,2));
if(!baseline){
 const b=JSON.parse(fs.readFileSync('artifacts/uniform/baseline.json')).baseline;
 const {contacts:_ignored,...defaultState}=results.default;
 const normalize=v=>JSON.parse(JSON.stringify(v,(k,x)=>typeof x==='string'? (x==='' && k==='theme'?'--theme: 0; --figure-theme: 0;':x.replace(/-?\d+\.\d+/g,n=>(+n).toFixed(4))):x));
 assert.deepEqual(normalize(defaultState),normalize(b));
 let maxFootError=0,maxHandError=0;
 results.default.contacts.forEach((points,i)=>{
  for(const id of ['ankle-left','ankle-right']) if(Math.abs(points[id].y-588.5)<0.01) maxFootError=Math.max(maxFootError,Math.abs(results.uniform.contacts[i][id].y-595.5));
  if(i<44) for(const id of ['wrist-left','wrist-right']) maxHandError=Math.max(maxHandError,Math.hypot(points[id].x-results.uniform.contacts[i][id].x,points[id].y-results.uniform.contacts[i][id].y));
  assert.equal(results.uniform.samples[i].theme || '--theme: 0; --figure-theme: 0;',results.default.samples[i].theme || '--theme: 0; --figure-theme: 0;');
 });
 console.log({maxFootError,maxHandError});
 assert.ok(maxFootError<0.01); assert.ok(maxHandError<0.05);

 const [cx,cy,r]=results.uniform.geometry.knob;
 const parts=results.uniform.geometry.track.split(' ');
 const top=+parts[2], capX=+parts[4], capR=+parts[6], bottom=+parts[12];
 const gaps=[cy-r-1.5-(top+1.5),bottom-1.5-(cy+r+1.5),capX+capR-1.5-(cx+r+1.5)];
 assert.deepEqual(gaps,[12,12,12]);
 assert.ok(results.uniform.geometry.widths.every(w=>w==='3px'));
 assert.ok(results.uniform.geometry.joints.every(r=>r==='1.5px'));
 console.log('PASS: default DOM/geometry identical to baseline; clearances all 12 SVG units; feet grounded and hands retained at sampled push frames; all strokes 3 and joint radii 1.5.');
}
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

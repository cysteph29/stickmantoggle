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
 const snap=async(label)=>{await page.screenshot({path:`artifacts/uniform/${name}-${label}.png`});return state()};
 results[name]={initial:await snap('initial')};
 await page.locator('#knob').click();
 await page.evaluate(()=>{g.globalTimeline.getChildren(false,true,true).find(t=>t.duration()===1.2).progress(1,false)});
 await page.evaluate(()=>{window.tl=g.globalTimeline.getChildren(false,true,true).find(t=>t.labels?.push2!==undefined);tl.pause().time(0,false)});
 results[name].samples=[];
 for(let t=0;t<12;t+=0.1){await page.evaluate(t=>{tl.time(t,false)},t);results[name].samples.push(await state())}
 await page.evaluate(()=>{tl.time(tl.labels.push2+0.5,false)});
 results[name].push=await snap('strongest-push');
 await page.evaluate(()=>{tl.progress(1,false)});
 results[name].completed=await snap('completed');
 results[name].geometry=await page.evaluate(()=>({track:document.querySelector('#track').getAttribute('d'),knob:[...['cx','cy','r']].map(a=>+document.querySelector('#knob').getAttribute(a)),widths:[...document.querySelectorAll('.limb,.head,.knob,.track')].map(e=>getComputedStyle(e).strokeWidth),joints:[...document.querySelectorAll('.joint-dot')].map(e=>getComputedStyle(e).r)}));
}
fs.writeFileSync(`artifacts/uniform/${baseline?'baseline':'results'}.json`,JSON.stringify(results,null,2));
if(!baseline){
 const b=JSON.parse(fs.readFileSync('artifacts/uniform/baseline.json')).baseline;
 assert.deepEqual(results.default,b);
 for(const key of ['initial','samples','push','completed']) assert.deepEqual(results.uniform[key],results.default[key]);
 const [cx,cy,r]=results.uniform.geometry.knob;
 const parts=results.uniform.geometry.track.split(' ');
 const top=+parts[2], capX=+parts[4], capR=+parts[6], bottom=+parts[12];
 const gaps=[cy-r-1.5-(top+1.5),bottom-1.5-(cy+r+1.5),capX+capR-1.5-(cx+r+1.5)];
 assert.deepEqual(gaps,[5,5,5]);
 assert.ok(results.uniform.geometry.widths.every(w=>w==='3px'));
 assert.ok(results.uniform.geometry.joints.every(r=>r==='1.5px'));
 console.log('PASS: default DOM/geometry identical to baseline; clearances all 5 SVG units; variant poses/theme identical at 120 samples; all strokes 3 and joint radii 1.5.');
}
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

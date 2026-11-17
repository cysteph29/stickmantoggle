const fs = require('fs');
const assert = require('assert/strict');
const { chromium } = require('/Users/cyrilstephen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
const browser = await chromium.launch({channel:'chrome',headless:true});
const page = await browser.newPage({viewport:{width:1440,height:900}});
const out='artifacts/arms-handoff/';
const results={};
async function load(query) {
 await page.goto('http://127.0.0.1:5175/'+query);
 await page.evaluate(async()=>{
 const url=performance.getEntriesByType('resource').find(e=>e.name.includes('/gsap.js?')).name;
 window.g=(await import(url)).default;
 });
}
async function snap(name) {
 console.log('capture',name);
 await page.screenshot({path:out+name+'.png'});
 return page.evaluate(()=>Object.fromEntries(['character-root','torso-pivot','chest-pivot','head-pivot','upper-arm-left-pivot','forearm-left-pivot','upper-arm-right-pivot','forearm-right-pivot','thigh-left-pivot','shin-left-pivot','thigh-right-pivot','shin-right-pivot','knob'].map(id=>[id,document.getElementById(id).getAttribute(id==='knob'?'cx':'transform')])));
}
for(const [name,query] of [['default',''],['walk','?intro=walk']]) {
 await load(query);
 results[name]={initial:await snap(name+'-initial')};
 await page.locator('#knob').click();
 if(query) await page.evaluate(()=>{g.globalTimeline.getChildren(false,true,true).find(t=>t.duration()===1.2).progress(1,false)});
 await page.evaluate(()=>{window.tl=g.globalTimeline.getChildren(false,true,true).find(t=>t.labels?.push2!==undefined);tl.pause().time(0,false)});
 results[name].contact=await snap(name+'-contact');
 console.log(await page.evaluate(()=>({labels:tl.labels,duration:tl.duration()})));
 await page.evaluate(()=>{tl.time(tl.labels.push2+0.5,false)});
 results[name].widest=await snap(name+'-widest-push');
 // Capture the authored endpoint without running the completion callback.
 await page.evaluate(()=>{tl.eventCallback('onComplete',null);tl.progress(1,false)});
 results[name].authored=await snap(name+'-authored-ending');
 await load(query);
 await page.locator('#knob').click();
 // Attach after the optional entrance has naturally completed.
 await page.waitForFunction(()=>g.globalTimeline.getChildren(false,true,true).some(t=>t.labels.rest!==undefined));
 await page.evaluate(()=>{
 const t=g.globalTimeline.getChildren(false,true,true).find(t=>t.labels.rest!==undefined);
 const cb=t.eventCallback('onComplete');
 t.eventCallback('onComplete',()=>{cb();window.completedAt=performance.now()});
 });
 await page.waitForFunction(()=>window.completedAt!==undefined,{},{timeout:20000});
 results[name].completed=await snap(name+'-completed');
 await page.waitForTimeout(2000);
 results[name].hold=await snap(name+'-hold-2s');
 assert.deepEqual(results[name].completed,results[name].authored);
 assert.deepEqual(results[name].hold,results[name].authored);
 for(const [id,angle] of [['upper-arm-left-pivot',14],['forearm-left-pivot',-8],['upper-arm-right-pivot',7],['forearm-right-pivot',-4]]) assert.equal(results[name].hold[id],`rotate(${angle})`);
}
fs.writeFileSync(out+'results.json',JSON.stringify(results,null,2));
console.log('PASS: both natural completions and 2s holds match the authored ending; arms 14/-8 and 7/-4 degrees.');
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

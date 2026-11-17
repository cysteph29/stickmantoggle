const {chromium}=require('/Users/cyrilstephen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1440,height:900}});
const results=[];
for(const query of ['', '?intro=walk']){
await p.goto('http://127.0.0.1:5175/'+query);await p.evaluate(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('/gsap.js?')).name;window.g=(await import(url)).default;document.querySelector('#knob').dispatchEvent(new MouseEvent('click',{bubbles:true}));});
if(query)await p.evaluate(()=>{g.globalTimeline.getChildren(false,true,true)[0].progress(1,false)});
await p.evaluate(()=>{g.globalTimeline.getChildren(false,true,true)[0].progress(1,false)});await p.waitForTimeout(100);
results.push(await p.evaluate(()=>{const svg=document.querySelector('svg').cloneNode(true);svg.querySelector('defs')?.remove();const actor=svg.querySelector('#walk-actor');if(actor)actor.replaceWith(...actor.childNodes);return svg.outerHTML}));
await p.screenshot({path:'artifacts/walk-endpoint/'+(query?'actual-final-alternate':'actual-final-default')+'.png'});
}
console.log('Actual completion callback final DOM identical:',results[0]===results[1]);
await b.close();})();

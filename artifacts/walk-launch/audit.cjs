const fs=require('fs'),assert=require('assert/strict');
const {chromium}=require('/Users/cyrilstephen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1440,height:900}});
const metrics=JSON.parse(fs.readFileSync('artifacts/walk-launch/metrics.json'));
const baseline=JSON.parse(fs.readFileSync('artifacts/arms-handoff/results.json')).default;
for(const query of ['', '?intro=walk']){
await p.goto('http://127.0.0.1:5175/'+query);
await p.evaluate(async()=>{window.g=(await import(performance.getEntriesByType('resource').find(e=>e.name.includes('/gsap.js?')).name)).default});
await p.locator('#knob').click();
if(query)await p.evaluate(()=>{g.globalTimeline.getChildren(false,true,true).find(t=>t.duration()===1.2).progress(1,false)});
await p.evaluate(()=>{window.tl=g.globalTimeline.getChildren(false,true,true).find(t=>t.labels?.rest);tl.pause()});
for(const [name,t] of [['contact',0],['widest',3.75],['catch',7.15],['hold',10.48]]){
await p.evaluate(t=>{tl.time(t,false)},t);
const data=await p.evaluate(()=>Object.fromEntries(['character-root','torso-pivot','chest-pivot','head-pivot','upper-arm-left-pivot','forearm-left-pivot','upper-arm-right-pivot','forearm-right-pivot','thigh-left-pivot','shin-left-pivot','thigh-right-pivot','shin-right-pivot','knob'].map(id=>[id,document.getElementById(id).getAttribute(id==='knob'?'cx':'transform')])));
if(!query&&baseline[name])for(const id in data){const nums=s=>s.match(/-?\d+(?:\.\d+)?/g).map(Number);const a=nums(data[id]),c=nums(baseline[name][id]);assert.equal(a.length,c.length);a.forEach((v,i)=>assert(Math.abs(v-c[i])<1e-5,`${name} ${id}`));}
if(query&&['catch','hold'].includes(name)){
const key=name==='hold'?'final':'catch';
metrics[key].headKnobClearance=await p.evaluate(()=>{
const h=document.getElementById('head'),m=h.getCTM(),hp=new DOMPoint(0,-20).matrixTransform(m);
const k=document.getElementById('knob'),kp=new DOMPoint(+k.getAttribute('cx'),+k.getAttribute('cy')).matrixTransform(k.getCTM());
return Math.hypot(hp.x-kp.x,hp.y-kp.y)/Math.hypot(m.a,m.b)-168;
});
if(name==='hold'){
assert.equal(data['upper-arm-left-pivot'],'rotate(14)');assert.equal(data['forearm-left-pivot'],'rotate(-8)');assert.equal(data['upper-arm-right-pivot'],'rotate(7)');assert.equal(data['forearm-right-pivot'],'rotate(-4)');
metrics.final.transforms=data;
}
}
}
}
metrics.defaultUnchanged=true;
fs.writeFileSync('artifacts/walk-launch/metrics.json',JSON.stringify(metrics,null,2));console.log(metrics);await b.close();
})().catch(e=>{console.error(e);process.exit(1)});

const fs = require('node:fs');
const {spawn} = require('node:child_process');
const {chromium} = require('/Users/cyrilstephen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const tag = process.argv[2] || 'before';
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:5174/?intro=walk');
await page.locator('#knob').waitFor();
const meta=await page.evaluate(async()=>{
 const {createPushTimeline}=await import('/src/toggle/pushTimeline.ts');
 const {alternatePushRig}=await import('/src/toggle/walkPush.ts');
 const {applyRig,rigToPose}=await import('/src/toggle/pushRig.ts');
 const svg=document.querySelector('#toggle-stage');
 document.querySelector('#walk-actor').setAttribute('opacity','1');
 window.review=createPushTimeline(svg,()=>{},(svg,rig,t)=>{
 const adjusted=alternatePushRig(rig,t); applyRig(svg,adjusted);
 window.state={time:t,base:{...rig},rig:adjusted,pose:rigToPose(adjusted)};
 }).pause();
 window.sample=t=>{review.time(t,false);return window.state};
 return {labels:review.labels,duration:review.duration()};
});
const samples=[];
for(let i=1;i<=Math.ceil(meta.duration*240);i++) samples.push(await page.evaluate(t=>sample(t),Math.min(i/240,meta.duration)));
fs.writeFileSync(`artifacts/stumble-absorption/${tag}-samples.json`,JSON.stringify({meta,samples}));
const encoder=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','60','-i','pipe:0','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',`artifacts/stumble-absorption/${tag}-normal.mp4`]);
const done=new Promise((resolve,reject)=>encoder.on('exit',c=>c?reject(Error(c)):resolve()));
for(let i=0;i<=Math.ceil((meta.duration-meta.labels.break+.5)*60);i++){
 await page.evaluate(t=>sample(t),meta.labels.break+i/60);
 const png=await page.screenshot();
 if(!encoder.stdin.write(png)) await new Promise(r=>encoder.stdin.once('drain',r));
}
encoder.stdin.end();await done;
for(const contact of [.82,1.28]) for(const dt of [-.04,0,.04,.08,.12,.16]){
 await page.evaluate(t=>sample(t),meta.labels.stumble+contact+dt);
 await page.screenshot({path:`artifacts/stumble-absorption/${tag}-${contact}-${dt.toFixed(2)}.png`});
}
console.log(tag,meta);
} finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

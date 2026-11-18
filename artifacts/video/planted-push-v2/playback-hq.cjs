const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('/Users/cyrilstephen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser = await chromium.launch({channel:'chrome',headless:true});
 try {
  const reports=[];
  for(const resolution of ['1080p','4k']) {
   const name=`walk-toggle-planted-push-${resolution}60`;
   const page=await browser.newPage({viewport:{width:1920,height:1080}});
   await page.goto(`file://${path.join(__dirname, name + ".mp4")}`);
   const result=await page.evaluate(async()=>{
    const v=document.querySelector('video');
    v.pause(); v.muted=true; v.currentTime=0;
    if(v.readyState < 4) await new Promise(resolve=>v.addEventListener('canplaythrough',resolve,{once:true}));
    const baseline=v.getVideoPlaybackQuality();
    const events=[];
    for(const type of ['waiting','stalled','error']) v.addEventListener(type,()=>events.push({type,time:v.currentTime}));
    await new Promise((resolve,reject)=>{v.onended=resolve;v.onerror=()=>reject(new Error('Video decode failed'));v.play().catch(reject)});
    const q=v.getVideoPlaybackQuality();
    return {duration:v.duration,currentTime:v.currentTime,ended:v.ended,width:v.videoWidth,height:v.videoHeight,totalVideoFrames:q.totalVideoFrames,droppedVideoFrames:q.droppedVideoFrames-baseline.droppedVideoFrames,events};
   });
   reports.push({name,...result});
   await page.close();
  }
  fs.writeFileSync(path.join(__dirname,'hq-playback-report.json'),JSON.stringify(reports,null,2));
  console.log(JSON.stringify(reports,null,2));
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

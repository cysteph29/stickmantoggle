// Decode the delivered MP4, audit every frame, and create visual review sheets.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
const sharp = require(path.join(process.env.NODE_MODULES || '/Users/cyrilstephen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules', 'sharp'));
const dir = __dirname;
const video = path.join(dir, 'walk-intro-1080p60.mp4');
const capture = JSON.parse(fs.readFileSync(path.join(dir, 'capture-report.json')));
(async () => {
  const raw = execFileSync('ffmpeg', ['-v','error','-i',video,'-vf','scale=960:540','-f','rawvideo','-pix_fmt','gray','pipe:1'], {maxBuffer: 500 * 1024 * 1024});
  const size = 960 * 540;
  assert.equal(raw.length / size, capture.frames);
  const differences = [];
  for (let i = 1; i < capture.frames; i++) {
    let sum = 0, changed = 0;
    for(let j = 0; j < size; j++) { const d = Math.abs(raw[i * size + j] - raw[(i-1) * size + j]); sum += d; if(d > 2) changed++; }
    differences.push({frame:i, mean:sum/size, changed});
  }
  const timestamps = JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp_time','-of','json',video], {maxBuffer: 2e6})).frames;
  timestamps.forEach((f,i) => assert(Math.abs(+f.best_effort_timestamp_time - i/60) < 0.000002));
  const motionDuplicates = differences.filter(d => d.frame > 48 && d.frame < capture.finishFrame && d.mean === 0);
  const unexpectedDuplicates = motionDuplicates.filter(d => capture.samples[d.frame].imageHash !== capture.samples[d.frame-1].imageHash);
  assert.equal(unexpectedDuplicates.length, 0, 'Encoder froze a changing source frame');
  const final = raw.subarray((capture.frames-1)*size);
  let holdMaxMean = 0;
  for(let i=capture.finishFrame;i<capture.frames;i++) { let sum=0; for(let j=0;j<size;j++) sum+=Math.abs(raw[i*size+j]-final[j]); holdMaxMean=Math.max(holdMaxMean,sum/size); }
  const decode = n => execFileSync('ffmpeg',['-v','error','-i',video,'-vf',`select=eq(n\\,${n}),scale=flags=accurate_rnd+full_chroma_int,format=rgb24`,'-frames:v','1','-f','image2pipe','-vcodec','png','pipe:1'],{maxBuffer: 10e6});
  await sharp(decode(0)).png().toFile(path.join(dir,'initial-decoded.png'));
  await sharp(decode(capture.frames-1)).png().toFile(path.join(dir,'final-decoded.png'));
  async function sheet(name, frames, crop, width, cols) {
    const height = Math.round(crop.height*width/crop.width);
    const tiles = [];
    for(const n of frames) {
      const img = await sharp(decode(n)).extract(crop).resize(width,height).toBuffer();
      const label = Buffer.from(`<svg width="${width}" height="30"><rect width="100%" height="100%" fill="#eeeeec"/><text x="10" y="21" font-family="sans-serif" font-size="15">Frame ${n} · ${(n/60).toFixed(3)}s</text></svg>`);
      tiles.push(await sharp({create:{width,height:height+30,channels:3,background:'#eeeeec'}}).composite([{input:img,left:0,top:30},{input:label,left:0,top:0}]).png().toBuffer());
    }
    await sharp({create:{width:width*cols,height:(height+30)*Math.ceil(frames.length/cols),channels:3,background:'#eeeeec'}}).composite(tiles.map((input,i)=>({input,left:i%cols*width,top:Math.floor(i/cols)*(height+30)}))).png().toFile(path.join(dir,name));
  }
  await sheet('overview-decoded.png',[0,30,39,66,96,102,180,330,369,390,480,600,720,731,820],{left:180,top:345,width:1560,height:435},624,3);
  await sheet('ripple-decoded.png',[29,30,33,36,39,42,45,48],{left:548,top:474,width:190,height:190},190,4);
  await sheet('handoff-release-decoded.png',[98,99,100,101,102,103,104,105,366,367,368,369,370,371,372,373],{left:235,top:360,width:1140,height:390},456,4);
  const report = {decodedFrames:capture.frames, duration:capture.duration, regular60fpsTimestamps:true, unexpectedDuplicateFrames:unexpectedDuplicates, authoredStaticFrames:motionDuplicates.map(d=>d.frame), finalHoldMaxMeanPixelDifference:holdMaxMean, differences};
  fs.writeFileSync(path.join(dir,'verification-report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({...report,differences:undefined},null,2));
})();

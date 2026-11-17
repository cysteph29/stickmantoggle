const {chromium}=require('/Users/cyrilstephen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('/Users/cyrilstephen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{
const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1440,height:900}});await p.goto('http://127.0.0.1:5175/?intro=walk');
await p.screenshot({path:'artifacts/walk-curve/empty.png'});
await p.evaluate(async()=>{const {createWalkIntro}=await import('/src/toggle/walkIntro.ts');window.walk=createWalkIntro(document.querySelector('svg'),()=>{}).pause()});
const tiles=[];
await p.evaluate(async()=>{const {createWalkPushTimeline}=await import('/src/toggle/walkPush.ts');window.push=createWalkPushTimeline(document.querySelector('svg'),()=>{}).pause();document.querySelector('#walk-actor').setAttribute('opacity','1');});
for(const [n,t] of [['wide',3.75],['release-before',4.44],['release',4.50],['stumble',4.65],['final',10.48]]){
await p.evaluate(t=>{push.time(t,false)},t);const buf=await p.screenshot({path:`artifacts/walk-curve/${n}.png`});tiles.push(await sharp(buf).extract({left:240,top:350,width:900,height:300}).resize(900,300).png().toBuffer());}
await sharp({create:{width:1800,height:900,channels:3,background:'#f3f3f1'}}).composite(tiles.map((input,i)=>({input,left:i%2*900,top:Math.floor(i/2)*300}))).png().toFile('artifacts/walk-curve/push-preview.png');await b.close();})();

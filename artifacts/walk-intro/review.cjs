const {chromium}=require('/Users/cyrilstephen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('/Users/cyrilstephen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const fs=require('fs');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}, reducedMotion:'no-preference'});
await page.goto('http://127.0.0.1:5175/?intro=walk');
await page.screenshot({path:'artifacts/walk-intro/hidden.png'});
await page.evaluate(async()=>{
 const {createWalkIntro}=await import('/src/toggle/walkIntro.ts');
 window.walk=createWalkIntro(document.querySelector('svg'),()=>{}).pause();
});
const shots=[['reveal',.12],['first-contact',.28],['second-contact',.57],['final-plant',.89],['hands',1.04],['handoff',1.12]];
const tiles=[];
for (const [name,t] of shots){
 await page.evaluate(t=>{walk.time(t,false)},t);
 const png=await page.screenshot({path:`artifacts/walk-intro/${name}.png`});
 const crop=await sharp(png).extract({left:310,top:400,width:450,height:230}).resize(675,345).toBuffer();
 const label=Buffer.from(`<svg width="675" height="40"><rect width="675" height="40" fill="#f3f3f1"/><text x="15" y="27" font-family="sans-serif" font-size="19">${name} · ${t.toFixed(2)}s</text></svg>`);
 tiles.push(await sharp({create:{width:675,height:385,channels:3,background:'#f3f3f1'}}).composite([{input:crop,top:40,left:0},{input:label,top:0,left:0}]).png().toBuffer());
}
await sharp({create:{width:1350,height:1155,channels:3,background:'#f3f3f1'}}).composite(tiles.map((input,i)=>({input,left:i%2*675,top:Math.floor(i/2)*385}))).png().toFile('artifacts/walk-intro/contact-sheet.png');
// Sample actual SVG ankle positions, limb reach, frame continuity and light theme.
const gait=await page.evaluate(async()=>{
 const {sampleWalk,WALK_DURATION}=await import('/src/toggle/walkIntro.ts');
 const {rigToPose}=await import('/src/toggle/pushRig.ts');
 const rows=[];
 for(let i=0;i<=135;i++){
  const t=Math.min(WALK_DURATION,i/120);walk.time(t,false);
  const r=sampleWalk(t),p=rigToPose(r);
  const point=id=>{const el=document.getElementById(id);return {x:el.getCTM().e,y:el.getCTM().f}};
  rows.push({t,r,p,near:point('ankle-left'),far:point('ankle-right')});
 }
 return rows;
});
fs.writeFileSync('artifacts/walk-intro/gait.json',JSON.stringify(gait));
// Compare unmodified push output after entrance at every saved baseline timestamp.
const baseline=JSON.parse(fs.readFileSync('artifacts/walk-intro/before.json'));
await page.evaluate(async()=>{const {createPushTimeline}=await import('/src/toggle/pushTimeline.ts');window.pushReview=createPushTimeline(document.querySelector('svg'),()=>{}).pause();});
let mismatches=0;
for(const row of baseline.frames){
 const current=await page.evaluate(t=>{
 pushReview.time(t,false);
 const svg=document.querySelector('svg').cloneNode(true);svg.querySelector('defs').remove();const actor=svg.querySelector('#walk-actor');actor.replaceWith(...actor.childNodes);
 return {svg:svg.outerHTML,theme:document.documentElement.getAttribute('style')};
 },row.t);
 if(current.svg!==row.svg||current.theme!==row.theme)mismatches++;
}
console.log({pushFrames:baseline.frames.length,mismatches});
// Real click playback with rapid repeated clicks. Record frames at native playback speed.
await page.goto('http://127.0.0.1:5175/?intro=walk');
await page.evaluate(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('/gsap.js?')).name;window.gsap=(await import(url)).default;});
await page.locator('#knob').click();
await page.locator('#knob').click({clickCount:3});
console.log('active timelines after repeated clicks',await page.evaluate(()=>gsap.globalTimeline.getChildren(false,true,true).length));
// Screen capture screencast uses browser presentation timestamps for normal speed.
const cdp=await page.context().newCDPSession(page);
await page.goto('http://127.0.0.1:5175/?intro=walk');
const captures=[];
cdp.on('Page.screencastFrame',async e=>{captures.push({data:e.data,t:e.metadata.timestamp});await cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId});});
await cdp.send('Page.startScreencast',{format:'png',everyNthFrame:1});
await page.locator('#knob').click();await page.waitForTimeout(1800);
await cdp.send('Page.stopScreencast');
fs.mkdirSync('artifacts/walk-intro/playback',{recursive:true});
let manifest='';
for(let i=0;i<captures.length;i++){fs.writeFileSync(`artifacts/walk-intro/playback/${i}.png`,Buffer.from(captures[i].data,'base64'));manifest+=`file '${i}.png'\nduration ${i+1<captures.length?captures[i+1].t-captures[i].t:1/60}\n`;}
fs.writeFileSync('artifacts/walk-intro/playback/frames.txt',manifest);
await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
await page.locator('#knob').click();await page.waitForTimeout(40);
console.log('reduced motion',await page.locator('#walk-actor').evaluate(el=>({opacity:el.getAttribute('opacity'),mask:el.getAttribute('mask'),hip:el.querySelector('#character-root').getAttribute('transform')})));
await browser.close();
})();

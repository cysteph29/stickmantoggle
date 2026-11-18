import fs from 'node:fs';
import { createPushTimeline } from '../../src/toggle/pushTimeline.ts';
import { alternatePushRig } from '../../src/toggle/walkPush.ts';
import { walkContactArms } from '../../src/toggle/walkContactArms.ts';
import { INITIAL_RIG } from '../../src/toggle/pushRig.ts';
import { KNOB_Y, limbEnd, rotate, shoulderLocal } from '../../src/toggle/layout.ts';
globalThis.window={matchMedia:()=>({matches:false})};
globalThis.document={documentElement:{style:{setProperty(){}}}};
let current=INITIAL_RIG;
const tl=createPushTimeline({},()=>{},(_,r)=>{current={...r}}).pause();
function geometry(time){const r=alternatePushRig(current,time);const u=Math.min(1,Math.max(0,(time-.45)/.5));const arms=walkContactArms(r,1-u**3*(10-15*u+6*u*u));const sh=shoulderLocal(r.chest);const s=rotate(sh.x,sh.y,r.torso);const shoulder={x:r.hipX+r.drive-s.x,y:r.hipY+s.y};return{r,arms,shoulder};}
const initial=geometry(0);
const contacts=initial.arms.map(a=>{const e=limbEnd(a.upperLength,a.upper+initial.r.torso+initial.r.chest);const f=limbEnd(a.foreLength,a.upper+a.fore+initial.r.torso+initial.r.chest);return{side:a.side,x:initial.shoulder.x-e.x-f.x-initial.r.knobX,y:initial.shoulder.y+e.y+f.y-KNOB_Y,upperLength:a.upperLength,foreLength:a.foreLength,bend:a.fore};});
const samples=[];
for(let i=0;i<=3900;i++){const t=i/1000;tl.time(t,false);const g=geometry(t);samples.push({t,shoulder:g.shoulder,knobX:g.r.knobX,arms:g.arms.map((a,j)=>{const c=contacts[j];const x=g.r.knobX+c.x-g.shoulder.x,y=KNOB_Y+c.y-g.shoulder.y,d=Math.hypot(x,y),max=a.upperLength+a.foreLength;const cosine=(d*d-a.upperLength*a.upperLength-a.foreLength*a.foreLength)/(2*a.upperLength*a.foreLength);return{side:a.side,upperLength:a.upperLength,foreLength:a.foreLength,distance:d,maxReach:max,deficit:d-max,initialLengthDeficit:d-c.upperLength-c.foreLength,bendMagnitude:Math.abs(cosine)<=1?Math.acos(cosine)*180/Math.PI:null};})});}
const groups={};for(const side of ['left','right']){const values=samples.filter(s=>s.t<=1.55).map(s=>({t:s.t,...s.arms.find(a=>a.side===side)}));const invalid=values.filter(a=>a.deficit>1e-7);const runs=[];for(const v of invalid){const last=runs.at(-1);if(!last||v.t-last.end>.00101)runs.push({start:v.t,end:v.t,peak:v});else{last.end=v.t;if(v.deficit>last.peak.deficit)last.peak=v}}groups[side]={runs,peak:values.reduce((a,b)=>a.deficit>b.deficit?a:b)};}
fs.writeFileSync(new URL('./feasibility.json',import.meta.url),JSON.stringify({labels:tl.labels,contacts,groups,samples},null,2));console.log(JSON.stringify({labels:tl.labels,contacts,groups},null,2));tl.kill();process.exit();

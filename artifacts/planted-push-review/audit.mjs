import fs from 'node:fs';
import {walkDescentArms} from '../../src/toggle/walkDescentArms.ts';
import {limbEnd,rotate,shoulderLocal} from '../../src/toggle/layout.ts';
const source=JSON.parse(fs.readFileSync('artifacts/braced-push-review/samples.json'));
const points=[];
for(const s of source.samples){const {rig:r,arms}=walkDescentArms(s.r,s.t);const sh=shoulderLocal(r.chest);const z=rotate(sh.x,sh.y,r.torso);const shoulder={x:r.hipX+r.drive-z.x,y:r.hipY+z.y};const n=rotate(0,-34,r.chest);const nr=rotate(n.x,-30+n.y,r.torso);const b=rotate(0,-10,r.torso+r.chest);const h=rotate(0,-20,r.torso+r.chest+r.head);const head={x:r.hipX+r.drive-nr.x-b.x-h.x,y:r.hipY+nr.y+b.y+h.y};points.push({t:s.t,r,original:s.r,head,shoulder,arms:arms.map(a=>{const e=limbEnd(a.upperLength,a.upper+r.torso+r.chest),f=limbEnd(a.foreLength,a.upper+a.fore+r.torso+r.chest);return{...a,elbow:{x:shoulder.x-e.x,y:shoulder.y+e.y},hand:{x:shoulder.x-e.x-f.x,y:shoulder.y+e.y+f.y},relative:{x:shoulder.x-e.x-f.x-r.knobX,y:shoulder.y+e.y+f.y-434}}})});}
const initial=points[0];let maxHand=0,maxAt=0,maxFrame=0;const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
for(let i=0;i<points.length;i++){const p=points[i];if(p.t<=1.55)for(let j=0;j<2;j++){const d=dist(p.arms[j].relative,initial.arms[j].relative);if(d>maxHand){maxHand=d;maxAt=p.t}}
if(i&&p.t<3.3)maxFrame=Math.max(maxFrame,dist(p.arms[0].hand,points[i-1].arms[0].hand));}
fs.writeFileSync('artifacts/planted-push-review/numerical.json',JSON.stringify(points));console.log({maxHand,maxAt,maxFrame});
for(const t of [0,.45,.5,.95,1.55,1.7,2,2.25,2.5,2.65,3,3.2416666666666667,3.25]){const p=points.reduce((a,b)=>Math.abs(a.t-t)<Math.abs(b.t-t)?a:b);console.log(p.t,p.r.torso,p.r.head,p.arms.map(a=>({bend:a.fore,relative:a.relative})));}

import fs from 'node:fs';
import {walkDescentArms as beforeArms} from './before-walkDescentArms.ts';
import {limbEnd,rotate,shoulderLocal} from '../../src/toggle/layout.ts';
const points=JSON.parse(fs.readFileSync('artifacts/planted-push-review/numerical.json'));
const dist=(p,a,b)=>{const x=b.x-a.x,y=b.y-a.y,u=Math.min(1,Math.max(0,((p.x-a.x)*x+(p.y-a.y)*y)/(x*x+y*y)));return Math.hypot(p.x-a.x-u*x,p.y-a.y-u*y)};
function clearance(head,shoulder,arms){return Math.min(...arms.flatMap(a=>[dist(head,shoulder,a.elbow)-24.5,dist(head,a.elbow,a.hand)-24.5,Math.hypot(head.x-a.elbow.x,head.y-a.elbow.y)-26]));}
const samples=[];
for(const p of points){if(p.t>=3.25)break;const r=p.original,u=Math.min(1,Math.max(0,(p.t-.45)/.5));const aa=beforeArms(r,p.t,1-u**3*(10-15*u+6*u*u));const z=shoulderLocal(r.chest),sh=rotate(z.x,z.y,r.torso),shoulder={x:r.hipX-sh.x,y:r.hipY+sh.y};const n=rotate(0,-34,r.chest),nr=rotate(n.x,-30+n.y,r.torso),b=rotate(0,-10,r.torso+r.chest),h=rotate(0,-20,r.torso+r.chest+r.head);const head={x:r.hipX-nr.x-b.x-h.x,y:r.hipY+nr.y+b.y+h.y};const arms=aa.map(a=>{const e=limbEnd(a.upperLength,a.upper+r.torso+r.chest),f=limbEnd(a.foreLength,a.upper+a.fore+r.torso+r.chest);return{elbow:{x:shoulder.x-e.x,y:shoulder.y+e.y},hand:{x:shoulder.x-e.x-f.x,y:shoulder.y+e.y+f.y}}});samples.push({t:p.t,before:clearance(head,shoulder,arms),after:clearance(p.head,p.shoulder,p.arms)});}
const firstOverlap=samples.find(p=>p.after<0);const newOverlaps=samples.filter(p=>p.after<0&&p.before>=0);const result={firstOverlap,newOverlaps,samples};fs.writeFileSync('artifacts/planted-push-review/clearance.json',JSON.stringify(result,null,2));console.log({firstOverlap,newOverlaps:newOverlaps.length});

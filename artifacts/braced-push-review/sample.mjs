import fs from 'node:fs';
import {walkContactArms} from '../../src/toggle/walkContactArms.ts';
const source=JSON.parse(fs.readFileSync('artifacts/first-arm-review/before.json'));
for(const s of source.samples){const u=Math.min(1,Math.max(0,(s.t-.45)/.5));s.links=walkContactArms(s.r,1-u**3*(10-15*u+6*u*u));}
fs.writeFileSync('artifacts/braced-push-review/samples.json',JSON.stringify(source));

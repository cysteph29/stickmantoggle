from pathlib import Path
import json,xml.etree.ElementTree as ET,math,re
from PIL import Image,ImageDraw
root=Path(__file__).parent
before=json.loads((root/'before/states.json').read_text());after=json.loads((root/'after/states.json').read_text())
armids={f'{prefix}-{side}{suffix}' for side in ['left','right'] for prefix,suffix in [('upper-arm',''),('upper-arm','-pivot'),('elbow',''),('forearm',''),('forearm','-pivot'),('wrist','')]}
maxstep=0
maxsurface=0
for i,(b,a) in enumerate(zip(before,after)):
 assert a['theme']==b['theme']
 be=ET.fromstring(b['svg']);ae=ET.fromstring(a['svg'])
 for x,y in zip(be.iter(),ae.iter()):
  if x.attrib.get('id') not in armids:assert x.attrib==y.attrib,(a['t'],x.attrib,y.attrib)
 if a['t']<=.48 or a['t']>=3.25:assert a['svg']==b['svg'],a['t']
 for n,(ba,aa) in enumerate(zip(b['arms'],a['arms'])):
  assert ba['upper']==aa['upper'] and ba['fore']==aa['fore']
  if .48<a['t']<3.25:assert float(re.search(r'rotate\((.*?)\)',aa['bend'])[1])>0
  if .48<a['t']<3.25:
   def offset(hand,knob):
    return hand['x']-knob['x']+math.sqrt(max(0,knob['r']**2-(hand['y']-knob['y'])**2))
   maxsurface=max(maxsurface,abs(offset(aa['hand'],a['knob'])-offset(ba['hand'],b['knob'])))
   assert aa['elbow']['x']<aa['hand']['x']
   if i:maxstep=max(maxstep,math.dist(list(aa['elbow'].values()),list(after[i-1]['arms'][n]['elbow'].values())))
assert maxsurface<1e-4,maxsurface
report={'max_surface_offset_change_px':maxsurface,'samples':len(after),'fps':60,'changed_interval_seconds':[.48,3.25],'non_arm_svg_attributes':'identical','outside_interval_svg':'identical','bone_lengths_vs_baseline':'identical','elbow_bend_sign':'positive throughout corrected interval','max_elbow_step_px_at_60fps':maxstep}
(root/'verification.json').write_text(json.dumps(report,indent=2));print(report)
cols=[('Initial contact',0),('Early descent',.55),('Middle descent',.7),('Low hold',.95),('Transition to stronger push',2.9),('Stronger push',3.75)]
im=Image.new('RGB',(2100,680),'white');d=ImageDraw.Draw(im)
for row,mode in enumerate(['before','after']):
 for col,(label,t) in enumerate(cols):
  x=col*350;y=row*340
  d.text((x+12,y+12),mode.upper()+' | '+label,fill='black')
  d.text((x+12,y+30),f'Push timeline: {t:.2f}s',fill='#555')
  crop=Image.open(root/mode/f'{t:.3f}.png').crop((175,250,550,550)).resize((350,280))
  im.paste(crop,(x,y+55))
im.save(root/'comparison.png')

from pathlib import Path
from PIL import Image,ImageDraw,ImageChops
import json,math,xml.etree.ElementTree as ET
root=Path(__file__).parent
b=json.loads((root/'before/states.json').read_text());a=json.loads((root/'after/states.json').read_text())
allowed={'torso-pivot','chest-pivot','head-pivot','torso'}|{f'{p}-{s}{z}'for s in ['left','right']for p,z in [('upper-arm',''),('upper-arm','-pivot'),('forearm',''),('forearm','-pivot'),('elbow',''),('wrist','')]}
for x,y in zip(b,a):
 assert x['t']==y['t'] and x['theme']==y['theme']
 for old,new in zip(ET.fromstring(x['svg']).iter(),ET.fromstring(y['svg']).iter()):
  if old.attrib.get('id')not in allowed:assert old.attrib==new.attrib,(x['t'],old.attrib,new.attrib)
 if x['t']>=3.25:assert x['svg']==y['svg'],x['t']
num=json.loads((root/'numerical.json').read_text());first=num[0];drift=0;surface=0;head_clear=999;dot_clear=999
protected=['hipX','hipY','drive','frontFootX','frontFootY','backFootX','backFootY','knobX']
def dist(p,a,b):
 dx=b['x']-a['x'];dy=b['y']-a['y'];u=max(0,min(1,((p['x']-a['x'])*dx+(p['y']-a['y'])*dy)/(dx*dx+dy*dy)));return math.hypot(p['x']-a['x']-u*dx,p['y']-a['y']-u*dy)
for p in num:
 for k in protected:assert p['r'][k]==p['original'][k]
 if p['t']>=3.2:assert p['r']==p['original']
 if p['t']<3.2:
  for arm in p['arms']:
   assert arm['elbow']['x']<arm['hand']['x']
   surface=max(surface,abs(math.hypot(arm['relative']['x'],arm['relative']['y'])-148))
 if p['t']<=1.55:
  for j,arm in enumerate(p['arms']):
   orig=first['arms'][j]
   assert arm['upperLength']==orig['upperLength'] and arm['foreLength']==orig['foreLength']
   drift=max(drift,math.dist(list(arm['relative'].values()),list(orig['relative'].values())))
   head_clear=min(head_clear,dist(p['head'],p['shoulder'],arm['elbow'])-24.5,dist(p['head'],arm['elbow'],arm['hand'])-24.5)
   dot_clear=min(dot_clear,math.dist(list(p['head'].values()),list(arm['elbow'].values()))-26)
assert drift<1e-8 and surface<.5 and head_clear>0 and dot_clear>0
same_initial=ImageChops.difference(Image.open(root/'before/0.000.png'),Image.open(root/'after/0.000.png')).getbbox()is None
report={'rendered_samples':len(a),'numerical_samples':len(num),'first_effort_max_wrist_drift_stage_units':drift,'first_effort_lengths':'constant at approved initial lengths','first_effort_min_head_to_arm_stroke_gap':head_clear,'first_effort_min_head_to_elbow_dot_gap':dot_clear,'modified_interval_max_hand_distance_from_knob_outline':surface,'protected_svg_attributes':'exact match throughout','theme':'exact match throughout','stronger_push_and_later_svg':'exact match from 3.25s','authored_rig_restored_at':3.2,'initial_frame_pixels_identical':same_initial,'playback_reviewed':False}
(root/'verification.json').write_text(json.dumps(report,indent=2));print(report)
cols=[('Initial contact',0),('Early descent',.5),('Middle descent',.65),('Late descent',.85),('Low hold',1.2),('Recoil / exit',1.7),('Regroup',2.65),('Stronger push',3.75)]
im=Image.new('RGB',(1400,1450),'white');d=ImageDraw.Draw(im)
d.text((12,8),'Red / blue reference marks: approved initial hand heights. Time is measured from walk contact.',fill='black')
for i,(label,t)in enumerate(cols):
 for row,mode in enumerate(['before','after']):
  x=i%4*350;y=30+(i//4*2+row)*355
  d.text((x+10,y+8),f'{mode.upper()} | {label}',fill='black');d.text((x+10,y+26),f'{t:.2f}s',fill='#555')
  im.paste(Image.open(root/mode/f'{t:.3f}.png').crop((175,250,550,550)).resize((350,280)),(x,y+50))
im.save(root/'comparison.png')
sets={'first-effort':[0,.15,.3,.4,.45,.5,.55,.6,.65,.7,.8,.9,.95,1.1,1.2,1.55], 'recoil-blend':[i/60 for i in range(93,124,2)],'regroup-blend':[2.25,2.4,2.5,2.6,2.65,2.7,2.8,2.9,3,3.05,3.1,3.15,3.183333333,3.2,3.25,3.75]}
for name,times in sets.items():
 im=Image.new('RGB',(1200,((len(times)+5)//6)*290),'white');d=ImageDraw.Draw(im)
 for i,t in enumerate(times):
  x=i%6*200;y=i//6*290;im.paste(Image.open(root/'after'/f'{t:.3f}.png').crop((180,330,370,540)).resize((200,250)),(x,y+30));d.text((x+10,y+8),f'{t:.3f}s',fill='black')
 im.save(root/(name+'.jpg'))

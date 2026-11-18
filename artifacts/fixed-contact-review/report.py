from pathlib import Path
from PIL import Image,ImageDraw
import json,math
root=Path(__file__).parent
states=json.loads((root/'rendered-states.json').read_text())
def distance(p,a,b):
 dx=b['x']-a['x'];dy=b['y']-a['y'];u=max(0,min(1,((p['x']-a['x'])*dx+(p['y']-a['y'])*dy)/(dx*dx+dy*dy)))
 return math.hypot(p['x']-a['x']-u*dx,p['y']-a['y']-u*dy)
rows=[];maxerror=0
for a in states:
 if not a['trial'] or a['t']>1.55:continue
 for arm in a['arms']:
  gap=math.hypot(arm['target']['x']-arm['hand']['x'],arm['target']['y']-arm['hand']['y'])
  if not arm['deficit']:maxerror=max(maxerror,gap)
  rows.append({'t':a['t'],'side':arm['side'],'unreachable_deficit':arm['deficit'],'hand_target_gap':gap,'head_clearance':min(distance(a['head'],arm['shoulder'],arm['elbow']),distance(a['head'],arm['elbow'],arm['hand']))-a['head']['r'],'elbow_behind_hand':arm['elbow']['x']<arm['hand']['x']})
collisions=[r for r in rows if r['side']=='left' and r['unreachable_deficit']==0 and r['head_clearance']<0]
result={'status':'REJECTED — diagnostic only; production unchanged','max_reachable_hand_error':maxerror,'first_reachable_near_head_collision':collisions[0] if collisions else None,'low_hold':next(r for r in rows if r['t']==.95 and r['side']=='left'),'samples':rows}
(root/'render-audit.json').write_text(json.dumps(result,indent=2));print({k:v for k,v in result.items()if k!='samples'})
cols=[('Initial contact',0),('Early descent / reach gap',.5),('Middle descent',.65),('Late descent',.85),('Low hold / head collision',1.2),('Exit: unchanged, no fix',1.7),('Stronger push: unchanged',3.75)]
im=Image.new('RGB',(2450,755),'white');d=ImageDraw.Draw(im)
d.text((12,8),'REFERENCE MARKS: red = initial near-hand height; blue = initial far-hand height. Circles follow knob. No production changes.',fill='black')
for row,mode in enumerate(['before','fixed-contact-test']):
 y=35+row*355
 d.text((12,y), 'CURRENT: downward slide (rejected)' if row==0 else 'FIXED-CONTACT DIAGNOSTIC: rejected for reach failure and head intersection; NOT an implemented after',fill='black')
 for col,(label,t) in enumerate(cols):
  x=col*350;d.text((x+10,y+22),label,fill='black');d.text((x+10,y+38),f'{t:.2f}s after walk contact',fill='#555')
  pic=Image.open(root/mode/f'{t:.3f}.png').crop((175,250,550,550)).resize((350,280));im.paste(pic,(x,y+58))
im.save(root/'comparison.png')
times=[0,.05,.1,.3,.45,.5,.55,.6,.65,.7,.8,.95,1.2,1.55,1.7,2.65,3.25,3.75]
im=Image.new('RGB',(1200,((len(times)+5)//6)*290),'white');d=ImageDraw.Draw(im)
for i,t in enumerate(times):
 x=i%6*200;y=i//6*290
 im.paste(Image.open(root/'fixed-contact-test'/f'{t:.3f}.png').crop((180,330,350,540)).resize((200,250)),(x,y+30));d.text((x+7,y+8),f'Fixed-contact test: {t:.2f}s',fill='black')
im.save(root/'fixed-contact-sequence.jpg')

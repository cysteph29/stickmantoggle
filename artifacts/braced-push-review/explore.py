import json,math,numpy as np
from scipy.optimize import minimize
S=json.load(open('artifacts/braced-push-review/samples.json'))['samples']
contacts=[np.array([-147.83221051927615,-7.045390903592363]),np.array([-146.2647716528043,20.79683596577695])]
def rot(p,a):
 a=math.radians(a);return np.array([p[0]*math.cos(a)-p[1]*math.sin(a),p[0]*math.sin(a)+p[1]*math.cos(a)])
def shoulder(chest):return np.array([0,-30])+rot([0,-22],chest)
def world(p,r):return np.array([r['hipX']-p[0],r['hipY']+p[1]])
def segdist(p,a,b):
 v=b-a;u=np.clip(np.dot(p-a,v)/np.dot(v,v),0,1);return np.linalg.norm(p-a-u*v)
def evaluate(s,torso,chest,head,bend=-1):
 r=s['r'];sh=world(rot(shoulder(chest),torso),r)
 neck=world(rot(np.array([0,-30])+rot([0,-34],chest),torso),r)
 base=neck+np.array([-1,1])*rot([0,-10],torso+chest)
 hc=base+np.array([-1,1])*rot([0,-20],torso+chest+head)
 out=[]
 for i,c in enumerate(contacts):
  h=c+np.array([r['knobX'],434]);v=h-sh;d=np.linalg.norm(v);l1=s['links'][i]['upperLength'];l2=s['links'][i]['foreLength'];along=(l1*l1-l2*l2+d*d)/(2*d);height=math.sqrt(max(0,l1*l1-along*along));sign=bend if i==0 else 1;e=sh+v/d*along+sign*np.array([-v[1],v[0]])/d*height
  out.append(dict(sh=sh,e=e,h=h,hc=hc,reach=l1+l2-d,clear=min(segdist(hc,sh,e),segdist(hc,e,h))-23,back=h[0]-e[0],bend=math.degrees(math.acos(np.clip((d*d-l1*l1-l2*l2)/(2*l1*l2),-1,1)))))
 return out
if __name__=='__main__':
 for t in [0,.15,.45,.5,.65,.95,1.2,1.55,1.7,2.25]:
  s=min(S,key=lambda s:abs(s['t']-t));r=s['r'];base=np.array([r['torso'],r['chest'],r['head']])
  def fun(x):return np.sum(((x-base)*[1,1.2,.45])**2)
  def constraints(x):
   a=evaluate(s,*x);return np.array([v for z in a for v in [z['reach']-.03,z['clear'],z['back']-2]])
  best=None
  for guess in [base,[-10,0,45],[-25,-10,60],[-10,-20,75]]:
   q=minimize(fun,guess,constraints={'type':'ineq','fun':constraints},bounds=[(-65,25),(-45,45),(-80,100)],method='SLSQP',options={'maxiter':200,'ftol':1e-8})
   if q.success and (best is None or q.fun<best.fun):best=q
  print(t, None if best is None else (np.round(best.x,2).tolist(),round(best.fun,1),[(round(a['bend'],2),round(a['clear'],2),round(a['reach'],2))for a in evaluate(s,*best.x)]))

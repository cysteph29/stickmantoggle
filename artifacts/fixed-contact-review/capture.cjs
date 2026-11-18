const fs = require('fs');
const path = require('path');
const { chromium } = require('/Users/cyrilstephen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
    await page.goto('http://127.0.0.1:5173/?intro=walk');
    await page.locator('#knob').waitFor();
    await page.evaluate(async () => {
      const { createWalkPushTimeline } = await import('/src/toggle/walkPush.ts');
      const { solveTwoBone } = await import('/src/toggle/layout.ts');
      const { contacts } = await (await fetch('/artifacts/fixed-contact-review/feasibility.json')).json();
      const svg = document.querySelector('#toggle-stage');
      const tl = createWalkPushTimeline(svg, () => {}).pause();
      svg.getElementById('walk-actor').setAttribute('opacity', '1');
      const point = (el, x = 0, y = 0) => new DOMPoint(x, y).matrixTransform(el.getCTM()).matrixTransform(svg.getCTM().inverse());
      const get = id => svg.getElementById(id);
      const add = (tag, attrs) => { const el=document.createElementNS(svg.namespaceURI,tag);for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));get('review-marks').append(el);return el; };
      window.frame = (t, trial) => {
        get('review-marks')?.remove();
        tl.time(t + 1e-8, false);tl.time(t,false);
        const group=document.createElementNS(svg.namespaceURI,'g');group.id='review-marks';svg.append(group);
        const center=point(get('knob'),+get('knob').getAttribute('cx'),+get('knob').getAttribute('cy'));
        const cx=center.x,cy=center.y;
        const results=[];
        for(let i=0;i<2;i++) {
          const c=contacts[i],side=c.side;
          const target={x:cx+c.x,y:cy+c.y};
          const upper=+get(`upper-arm-${side}`).getAttribute('y2'),fore=+get(`forearm-${side}`).getAttribute('y2');
          const sh=point(get('shoulder'));
          const distance=Math.hypot(target.x-sh.x,target.y-sh.y);
          if(trial&&t<=1.55&&t>1e-5){
            const p=new DOMPoint(target.x,target.y).matrixTransform(svg.getCTM()).matrixTransform(get('shoulder').getCTM().inverse());
            const a=solveTwoBone(upper,fore,p.x,p.y,i===0?-1:1);
            get(`upper-arm-${side}-pivot`).setAttribute('transform',`rotate(${a.upper})`);
            get(`forearm-${side}-pivot`).setAttribute('transform',`rotate(${a.lower})`);
          }
          const hand=point(get(`wrist-${side}`)),elbow=point(get(`elbow-${side}`));
          const color=i===0?'#c64835':'#087b99';
          add('line',{x1:cx-180,y1:target.y,x2:cx+5,y2:target.y,stroke:color,'stroke-width':1,'stroke-dasharray':'4 4'});
          add('circle',{cx:target.x,cy:target.y,r:4,fill:'none',stroke:color,'stroke-width':1.5});
          if(trial&&t<=1.55&&distance>upper+fore)add('line',{x1:hand.x,y1:hand.y,x2:target.x,y2:target.y,stroke:'#d00000','stroke-width':2,'stroke-dasharray':'2 2'});
          results.push({side,target,hand,elbow,shoulder:sh,upper,fore,deficit:Math.max(0,distance-upper-fore),offset:{x:hand.x-cx,y:hand.y-cy}});
        }
        const head=get('head'),hp=point(head,+head.getAttribute('cx'),+head.getAttribute('cy'));
        return {t,trial,arms:results,head:{x:hp.x,y:hp.y,r:+head.getAttribute('r')}};
      };
    });
    const all=[];
    for(const mode of ['before','fixed-contact-test']) {
      const out=path.join(__dirname,mode);fs.mkdirSync(out,{recursive:true});
      for(let i=0;i<=225;i++){
        const t=i===0?.000001:i/60;
        all.push(await page.evaluate(({t,trial})=>window.frame(t,trial),{t,trial:mode!=='before'}));
        await page.locator('#toggle-stage').screenshot({path:path.join(out,`${t.toFixed(3)}.png`)});
      }
      console.log('Rendered',mode);
    }
    fs.writeFileSync(path.join(__dirname,'rendered-states.json'),JSON.stringify(all));
  } finally { await browser.close(); }
})();

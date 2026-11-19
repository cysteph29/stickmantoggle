/* Repeat: npm run dev -- --host 127.0.0.1 --port 5173
 *         node artifacts/video/capture-hq.cjs
 * Requires Playwright (Chrome), sharp, ffmpeg and ffprobe. Set NODE_MODULES
 * to their module directory if they are not installed in this project.
 * Only this disposable browser page receives capture CSS/instrumentation.
 */
const fs = require('node:fs');
const path = require('node:path');
const { spawn, execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const assert = require('node:assert/strict');
const modules = process.env.NODE_MODULES || '/Users/cyrilstephen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(modules, 'playwright'));
const out = __dirname;
const fps = 60;
const scale = Number(process.env.RENDER_SCALE || 2);
const name = `walk-intro-light-to-dark-${scale === 2 ? '4k' : '1080p'}60-hq`;
const file = path.join(out, name + '.mp4');
assert(!fs.existsSync(file), 'Refusing to overwrite an existing export');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale, reducedMotion: 'no-preference' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.env.CAPTURE_URL || 'http://127.0.0.1:5173/');
    await page.locator('#knob').waitFor();
    await page.addStyleTag({ content: '.stage-svg { width: 1680px !important; } * { cursor: none !important; }' });
    await page.evaluate(async () => {
      // Import the same Vite module singleton used by the application.
      const source = await (await fetch('/src/toggle/walkIntro.ts')).text();
      const url = source.match(/import gsap from ["']([^"']+)/)[1];
      const { default: gsap } = await import(url);
      const main = await (await fetch('/src/main.tsx')).text();
      const reactUrl = main.match(/["']([^"']*react-dom_client[^"']*)["']/)[1];
      const reactDom = await import(reactUrl.replace('react-dom_client', 'react-dom'));
      const flushSync = reactDom.flushSync || reactDom.default.flushSync;
      gsap.ticker.remove(gsap.updateRoot);
      gsap.ticker.sleep();
      gsap.updateRoot(0);
      const timelines = [];
      const original = gsap.timeline;
      gsap.timeline = function (options = {}) {
        const complete = options.onComplete;
        const entry = { completed: false };
        const tl = original.call(this, { ...options, onComplete: function () {
          entry.completed = true;
          entry.completedAt = gsap.globalTimeline.time();
          return complete?.apply(this, arguments);
        }});
        entry.tl = tl;
        timelines.push(entry);
        return tl;
      };
      const knob = document.querySelector('#knob');
      window.capture = {
        timelines,
        tick(t, click = false) {
          flushSync(() => gsap.updateRoot(t));
          if (click) {
            // One task, one timestamp: the real React click.
            const b = knob.getBoundingClientRect();
            flushSync(() => knob.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: b.x + b.width / 2, clientY: b.y + b.height / 2 })));
          }
          return {
            time: t,
            theme: document.documentElement.style.getPropertyValue('--theme'),
            timelines: timelines.map(e => ({ duration: e.tl.duration(), start: e.tl.startTime(), time: e.tl.time(), completed: e.completed, completedAt: e.completedAt, labels: e.tl.labels })),
            actor: document.querySelector('#walk-actor').innerHTML,
            bounds: ['#track', '#knob', '#character-root'].map(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.x, y: b.y, right: b.right, bottom: b.bottom }; }),
          };
        },
      };
    });
    const encoder = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-vcodec', 'png', '-i', 'pipe:0', '-an', '-vf', 'scale=in_range=pc:out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int', '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level:v', scale === 2 ? '5.2' : '4.2', '-movflags', '+faststart', '-x264-params', 'colorprim=bt709:transfer=bt709:colormatrix=bt709:range=tv', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', file], { stdio: ['pipe', 'inherit', 'inherit'] });
    const encoded = new Promise((resolve, reject) => { encoder.on('error', reject); encoder.on('exit', code => code === 0 ? resolve() : reject(new Error(`ffmpeg: ${code}`))); });
    const frames = [];
    let finishFrame;
    let holdPose;
    for (let i = 0; i < 1800; i++) {
      const state = await page.evaluate(({ t, click }) => window.capture.tick(t, click), { t: i / fps, click: i === 30 });
      assert.equal(errors.length, 0, errors.join('\n'));
      if (state.timelines.length === 2 && finishFrame === undefined) {
        assert(Math.abs(state.timelines[1].start - 1.7) < 1e-6, 'Entrance-to-push delay');
        finishFrame = Math.ceil((state.timelines[1].start + state.timelines[1].duration) * fps - 1e-6);
      }
      if (finishFrame !== undefined && i >= finishFrame) {
        assert(state.timelines.every(t => t.completed), 'Missing completion callback');
        assert.equal(+state.theme, 1);
        holdPose ||= state.actor;
        assert.equal(state.actor, holdPose, 'Final pose changed during hold');
      }
      const png = await page.screenshot({ type: 'png' });
      if (i === 30 || (finishFrame !== undefined && i === finishFrame + 89)) fs.writeFileSync(path.join(out, name + (i === 30 ? '-trigger-source.png' : '-final-source.png')), png);
      if (!encoder.stdin.write(png)) await new Promise(resolve => encoder.stdin.once('drain', resolve));
      const { actor, ...small } = state;
      frames.push({ frame: i, ...small, poseHash: createHash('sha256').update(actor).digest('hex'), imageHash: createHash('sha256').update(png).digest('hex') });
      if (i % 60 === 0) console.log(`Captured ${(i / fps).toFixed(1)}s`);
      if (finishFrame !== undefined && i === finishFrame + 89) break;
    }
    encoder.stdin.end();
    await encoded;
    const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', file]));
    const video = probe.streams[0];
    assert.equal(video.width, 1920 * scale); assert.equal(video.height, 1080 * scale);
    assert.equal(video.avg_frame_rate, '60/1'); assert.equal(+video.nb_read_frames, frames.length);
    assert.equal(probe.streams.length, 1);
    fs.writeFileSync(path.join(out, name + '-capture-report.json'), JSON.stringify({ fps, frames: frames.length, finishFrame, duration: frames.length / fps, probe, samples: frames }, null, 2));
    console.log(`Exported ${file}: ${frames.length} frames / ${frames.length / fps}s`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });

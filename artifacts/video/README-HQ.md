# High-quality walk-intro exports

- `walk-intro-light-to-dark-4k60-hq.mp4`: native 3840×2160 render, 60 fps.
- `walk-intro-light-to-dark-1080p60-hq.mp4`: native 1920×1080 render, 60 fps.

Both contain 821 frames (13.683333 seconds), H.264 High, CRF 12 / slow,
YUV 4:2:0, full-range RGB to limited-range BT.709 matrix conversion,
BT.709 metadata, fast-start MP4, and no audio. Levels are 5.2 and 4.2,
respectively. Original exports are retained.

The unchanged application is loaded at `http://127.0.0.1:5173/`.
No portfolio outro or click ripple is added. The shared GSAP root is advanced
at exact 1/60-second increments. The original React click is dispatched at
0.5 seconds; the entrance hands off to the push at 1.7 seconds. Recovery
completes at frame 731, followed by 90 completed-state frames (1.5 seconds).
The authored curved entrance reveal and any intentional occlusion are retained.

Both renders use a 1920×1080 CSS viewport and 1680px SVG width. Chrome rasterizes
the vector artwork directly at device scale 2 for 4K and scale 1 for 1080p;
no 1080p imagery is enlarged. Per-frame poses, theme values, and CSS bounds
match exactly between exports. Track, knob, and actor bounds stay within
the video frame throughout.

Reproduction (scripts refuse to overwrite the new MP4s):

```sh
npm run dev -- --host 127.0.0.1 --port 5173
node artifacts/video/capture-hq.cjs
RENDER_SCALE=1 node artifacts/video/capture-hq.cjs
node artifacts/video/verify-hq.cjs
EXPORT_NAME=walk-intro-light-to-dark-1080p60-hq node artifacts/video/verify-hq.cjs
node artifacts/video/playback-hq.cjs
```

Verification decodes all frames, checks frame counts and regular timestamps,
checks changing source frames for encoder freezes, and measures final-hold
stability. ffprobe confirms codec, dimensions, frame rate, pixel format and
color metadata. MP4 atom inspection confirms `moov` precedes `mdat`.
Decoded overview and consecutive handoff/release sheets were visually reviewed,
as was full-frame final composition. Headless Chrome plays each finished file
through to its end; `hq-playback-report.json` records playback metrics.
This is automated playback plus visual decoded-frame review, not a human
real-time viewing session.

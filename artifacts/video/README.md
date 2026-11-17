# Walk intro export

`walk-intro-1080p60.mp4`: 1920 × 1080, 60 fps, 821 frames, 13.683333 seconds.
H.264 High / Level 4.2, CRF 15, slow preset, YUV 4:2:0, BT.709 conversion and
metadata, fast-start MP4, no audio.

Repeat from the project root:

```sh
npm run dev -- --host 127.0.0.1 --port 5173
# In another terminal:
node artifacts/video/capture.cjs
node artifacts/video/verify.cjs
```

Requires Chrome, Playwright, sharp, ffmpeg and ffprobe. The scripts use the
available Codex runtime modules; override `NODE_MODULES` with another module
directory if needed. `CAPTURE_URL` can override the local development URL.

The capture injects a fixed 1680px SVG width into a disposable 1920 × 1080 page.
There is no camera movement. No application source or authored animation is
modified. The click dispatches through the actual React handler at 0.5s,
simultaneously showing one thin neutral SVG ring at the knob center. Its radius
expands linearly from 7 to 21 SVG units while opacity fades over 0.3s.

The shared GSAP root advances at 1/60s with its automatic ticker detached.
Events are not suppressed: the entrance completion creates the push at exactly
1.7s, and the push completion reconciles the final React pose using `flushSync`.
The 1.2s entrance and 10.48s push retain their original timings and callbacks.
The first completed frame is frame 731 (12.183333s, quantized to 60fps), followed
by a total of 90 completed-state frames for a 1.5s hold.

Verification decodes every MP4 frame, checks frame count and timestamps,
compares adjacent frames against capture hashes for unexpected freezes, and
checks final-hold stability. The capture also asserts both completion callbacks,
the exact entrance-to-push handoff, final theme, and unchanged final SVG pose.
Decoded contact sheets cover the ripple, handoff, release and final state.
The original curved entrance/recovery reveal remains exactly as authored;
the complete composition fits within the video frame with generous margins.

`capture-report.json` and `verification-report.json` retain per-frame audit data.
The PNG review sheets are separate QA artifacts and are not included in the video.

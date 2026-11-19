# Current planted-push exports

Captured the live http://127.0.0.1:5173/ application with the current production source. No saved pre-correction source or portfolio mode was used. Source SHA-256 manifest is included.

Both MP4s: 60 fps, 821 frames, 13.683333 seconds; H.264 High, CRF 12, slow preset, YUV 4:2:0, limited-range BT.709 conversion and metadata, fast-start, no audio. Trigger at frame 30 (0.5 seconds); entrance-to-push handoff at frame 102 (1.7 seconds); recovery completes at frame 731; 90 completed-state frames provide 1.5 seconds of final hold.

4K is native 3840 x 2160 browser rendering (1920 x 1080 CSS viewport, device pixel ratio 2); 1080p is independently rendered at pixel ratio 1. Both preserve the existing HQ 1680 CSS-pixel stage width and relative composition. No ripple, overlays, text, cursor, or camera effects were added. Application source was not edited.

## Verification

Every encoded frame was decoded for timestamp and adjacent-frame audits. Both files have 821 regularly spaced frames and no unexpected encoded freezes. Source final-pose hashes remain constant throughout the final hold. ffprobe specifications and file sizes appear in delivery-verification.json; full probe data and per-frame source hashes are in the capture reports.

Decoded first-effort frames at push-relative times 0, 0.5, 0.65, 0.85, 1.2, 1.7, 2.65 and 3.75 seconds were visually compared with artifacts/planted-push-review/comparison.png, ignoring its diagnostic guides. Both resolutions match the corrected AFTER poses: hands stay at the initial knob contacts during descent and low hold, then transition into recoil and the stronger push. Overview and handoff sheets cover entrance, push, release, stumble, recovery and final hold. No unexpected canvas clipping or visible encoding artifacts were found. The authored curved reveal/clipping is preserved, including the initially hidden entrance; this is not an encoder freeze.

Visual review was limited to decoded sequential frames/contact sheets, not watched real-time playback. An automated Chrome normal-speed playback test completed both videos with no waiting, stalled or error events. It reported one dropped playback frame per file; the encoded files themselves contain every expected frame. See hq-playback-report.json.

All 36 pre-existing files under artifacts/video and all 15 source files match their pre-capture SHA-256 checksums. Existing scripts, videos and reports remain unchanged. All new capture scripts, reports and screenshots are contained here.

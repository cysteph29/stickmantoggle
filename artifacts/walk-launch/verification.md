# Alternate launch correction

Only `src/toggle/walkPush.ts` changed during this pass.

The character now retains WALK_OFFSET_X = −198 SVG units throughout push, release, stumble, catch, breath, stand-up, gathering step, and final React reconciliation. Hip and both foot targets receive the same constant translation. No correction velocity is added, and authored support-foot positions, stride timing, and joint mechanics are preserved. The previous 0.22-second body-offset removal is gone.

The knob's separate offset correction remains unchanged and finishes at x=890.5. The approved start remains x=311.5. Entrance choreography, theme, geometry, and arms-down ending remain unchanged.

Verification:
- Recorded natural playback at normal speed, including actual completion and a two-second hold. Inspected release sequence at 40ms spacing (29 frames); the sheet displays every second frame.
- Sampled the authored and translated rigs every 10ms. Hip and both feet retain exactly −198 units of offset; released joint poses match within 7.2e−14 degrees. Thus fixed support targets remain fixed, and no adapter-induced sliding or teleporting is introduced.
- Curved clipping remains through recovery and is removed at settled catch, 7.15s into the push timeline. Clipped/unclipped catch captures reveal no new silhouette pixels; only one-level antialiasing differences occur inside the figure.
- Catch and final stance stay inside the track, retaining the existing ankle-dot floor overhang. Head-to-knob edge clearance: 223.97 SVG units at settled catch; 314.47 at final rest.
- Actual final rest holds the approved arm angles (14/−8 and 7/−4 degrees) and translated hip x=409.14372.
- Default contact, widest push, and completed pose match the previous pass within 0.00001 units/degrees (GSAP rounding). SHA-256 checks confirm App, ToggleStage, shared timeline, layout, entrance, and start-position source files are unchanged.
- Build, lint, and git diff --check passed.

[Normal-speed playback](normal-speed.mp4) · [Release frame sheet](release-sheet.png) · [Catch](catch.png) · [Actual final rest](final-completed.png) · [Two-second hold](final-hold.png) · [Metrics](metrics.json)

Reproduce with Vite on port 5175 and `PLAYWRIGHT_BROWSERS_PATH=/tmp/walk-playwright node artifacts/walk-launch/verify.cjs`, then `node artifacts/walk-launch/audit.cjs`. The temporary Playwright ffmpeg directory points to the installed system ffmpeg binary.

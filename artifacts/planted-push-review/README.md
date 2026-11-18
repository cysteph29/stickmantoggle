# Implemented planted-contact first effort

The old downward-contact search in `walkDescentArms.ts` was replaced. The entrance helper is used only to establish the approved initial geometry; its moving elbow offsets and arm compression are not evaluated during the first effort.

## Performance

- Initial contact and walk entrance are preserved. The initial before/after PNGs are pixel-identical.
- Both hands retain their exact initial knob-relative contacts through the descent (0.45–0.95s) and low hold (through 1.55s).
- Actual initial link lengths remain constant: near 33.269876 / 27.717986; far 27.707791 / 31.419973.
- The torso rotates about the unchanged hip, with a connected chest articulation and head tilt. No joints are translated independently or torso segments stretched.
- Recoil/regroup restore the existing 38 / 34 arm lengths by 2.25s. Contacts move directly toward the approved high stronger-push contacts, without visiting the former low contact pose.
- The near elbow passes continuously through neutral during recoil; its signed bend is used in the shoulder solve, avoiding an abrupt IK branch selection.
- A final blend rejoins the authored rig at 3.20s, before the stronger push starts at 3.25s. All later rendered SVG states match the saved production baseline exactly.

## Review

`comparison.png` shows initial contact, early/middle/late descent, low hold, recoil, regroup, and stronger push. Red and blue guides mark the original hand heights and appear only in review screenshots.

The complete sequence was rendered at 60 fps through 3.75s for both versions (226 screenshots each); 630 SVG states cover the full push/recovery. The first-effort, recoil-blend, and regroup-blend sheets were visually inspected, including the continuous elbow transition and final handoff. The hands visibly stay on their reference marks during the first effort; the low downward hand-slide action is absent. The head retraction was revised after the first capture to avoid a threshold-driven jump at recoil.

Numerical checks cover 1,259 samples. See `verification.json` and `clearance.json`:

- Maximum first-effort contact drift: 1.26e-12 SVG units.
- First-effort link lengths are constant.
- First-effort head clearance includes both limb strokes and elbow joint dots; minimum respective edge gaps are 1.02 and 0.32 SVG units.
- Protected SVG attributes (including hip, legs, feet, knob, layout and clipping) and theme values match throughout.
- The modified contacts remain within the existing knob outline stroke.
- No new time intervals of head/arm overlap were introduced relative to the saved production sequence. The original wind-up already occludes an arm behind the head near 3.125s; the handoff preserves that approved geometry rather than altering the stronger push.
- Default-mode source paths, portfolio timing and behavior, and final video exports were not changed.

`npm run build` and `npm run lint` passed.

Normal-speed and slow playback were **not reviewed**: the live browser bridge still fails to start. This was a rendered sequential-frame review, not a claim of watching playback.

Preview: http://127.0.0.1:5173/?intro=walk

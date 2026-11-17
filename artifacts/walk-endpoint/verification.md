# True left/off endpoint — implemented

Preview: http://127.0.0.1:5175/?intro=walk

The alternate start is derived by reflection across the existing visible track midpoint:

- Visible bounds: x=81.5 to x=1070.5; midpoint x=576.
- Final knob center: x=890.5.
- Reflected initial center: 2×576−890.5 = **261.5**.
- Alternate offset from the default start: **−248 SVG units**.
- Horizontal curve clearance at knob-center height: **32 units between centerlines, 29 units between visible strokes**, identical at left start and right finish.
- Top and bottom visible stroke gaps: **5 units** each, unchanged.
- Knob radius 148 and vertical center 434 remain unchanged.

Partial character visibility is intentional. The complete approach and pre-release rig are translated consistently; the old curve-floor foot adjustment was removed to preserve relative body mechanics offstage. The actual track-path clip remains active throughout entrance and early push. No fade or internal vertical reveal edge is used. The original flat-floor ankle stroke allowance remains confined to the flat span.

Release corrections use quintic curves with zero endpoint velocity and acceleration. The whole character translation ends at local 4.67 seconds, before the first lunge foot bears weight. The knob correction ends at 4.75 seconds. The character clip is removed at 4.69 seconds, after the body and limb strokes are safely inside. The original subsequent stumble, catch, breath, stand-up and narrow stance keys are untouched.

Verification:

- Default: **1,261 matching SVG/theme samples; zero mismatches** against the original baseline.
- Character after positional blend: **700 matching samples; zero mismatches**.
- Complete composition after the knob blend: **691 matching samples; zero mismatches**.
- Actual completion callback: final alternate/default DOM identical. Hidden alternate React pose inputs mirror the default so React reconciliation does not introduce a final arm difference.
- Original and alternate minimum head/knob geometric clearance during release: **3.8312 units**, equal within rendering precision; no added overlap.
- Entrance rendered foot-target error: less than **0.0002 SVG units**; offstage feet stay clipped.
- Entrance stays light; clip retained at hand contact and in reduced-motion mode.
- Repeated-click checks during entrance and push: same single timeline instance.
- Normal-speed browser recording captured with presentation timestamps; entrance and release sequences inspected for clipping, hand separation, and motion continuity.
- `npm run build`: passed after final implementation.
- `npm run lint`: passed without warnings after final implementation.

Review files:

- contact-sheet.png — empty left/off beside authored final dark state, first emergence, hand contact, widest push, release, fully visible character.
- playback.mp4 — actual browser playback through release.
- actual-final-default.png / actual-final-alternate.png — rendered state after React completion.
- capture.cjs / verify.cjs / final-check.cjs — local review utilities with workspace-specific dependency paths.

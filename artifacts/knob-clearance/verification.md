# Knob clearance verification

Before/after screenshots: [comparison](before-after.png). Rows: initial (0s), first push (0.95s), second push (3.75s), release (4.50s), dark hold (10.48s). Before is left; after is right. Full viewport PNGs are alongside this file.

- Knob center: y=439 → 434. Radius 148, stroke 3.
- Track ceiling path y=278, inner edge 279.5; floor path y=590, inner edge 588.5.
- Stroke-to-stroke top/bottom gaps: 10/0 → 5/5 SVG units.
- Final right elliptical cap minimum stroke clearance: 11.484 → 16.141 units (dense numerical arc sampling). Right cap center (950.5,434), radii (120,156); final knob center (890.5,434).
- 1,261 frames sampled over 10.48 seconds, at 120 Hz plus exact pose timestamps. Track path, composition, body and leg transforms, horizontal knob endpoints/travel, timeline labels, and theme values preserved. Initial solved leg angles differ only by floating point rounding; subsequent body/leg transforms match exactly. Feet retain their existing planted positions and authored airborne steps. Stumble, recovery and final stance unchanged.
- Gripping elbows retain their bend sign (no flips or wrapping). Near wrist remains on the circle until the late second push; far wrist retains the existing approximately 0.23–0.27-unit inset. No new visible hand penetration or outline gap.
- Artistic review candidate: near hand reaches extension limit from approximately 3.49s, far from 3.51s, through release at 4.45s. Maximum radial target shortfall occurs at 4.3583s: near 2.030 units, far 1.898 units. The 4.5-unit hand dots still overlap the 1.5-unit knob half-stroke. No pose keys were retuned.
- npm run build: passed.
- npm run lint: passed.

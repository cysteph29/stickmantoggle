# Ceiling verification

Visible ceiling path y: 230 → 278 (48 SVG units lower). Knob outer top: 289.5; ceiling inner stroke edge: 279.5; clearance: exactly 10 units.

Floor path y remains 590 (inner floor 588.5). Horizontal path bounds remain 81.5–1118.5. Elliptical end radii: 120 horizontal × 156 vertical. Flat floor junctions: 201.5 and 998.5. Only ToggleStage.tsx visual-path geometry changed.

Before and after: 1,261 identical chronological timestamps over 10.48 seconds, sampled at 120 Hz plus exact representative poses. Complete SVG markup excluding only track d is identical at every sample. Root theme styles, all exported layout constants, duration and labels are identical.

Boundary check: sampled all rendered character and knob contours every 2 SVG units, including stroke width and a 1.5-unit track-stroke allowance in 16 directions. No curved-wall or ceiling violations at any timestamp. Existing flat-floor contacts are exempted, including the authored foot joint dots. This is a dense sampled check, not a continuous mathematical proof.

Visually inspected full-page initial, widest push and final hold screenshots. No repositioning, scaling, recentering, fill changes or animation changes.

| Pose | Time | Before | After |
|---|---:|---|---|
| Initial | 0 | [Before](before-light-rest.png) | [After](after-light-rest.png) |
| Widest push | 3.75 | [Before](before-widest-push.png) | [After](after-widest-push.png) |
| Final hold | 10.48 | [Before](before-dark-hold.png) | [After](after-dark-hold.png) |

npm run build: passed. npm run lint: passed.

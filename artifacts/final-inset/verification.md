# Final inset verification — partial

Only source change in this pass: VISIBLE_TRACK_RIGHT subtracts 248 instead of 200. Right end moves inward 48 SVG units; the existing bounds-based centering expression automatically changes the uniform offset from 100 to 124. Left path geometry, ceiling y=278, floor y=590, stroke, elliptical radii 120×156 and all animation sources are unchanged.

Calculated final right-curve minimum stroke-to-stroke clearance: 11.483845 SVG units, at the lower curve/floor junction. Evaluated 100,001 points along the semicircle. Center-height horizontal stroke gap: 28.938347 units. Top stroke gap stays 10; bottom contact stays unchanged.

Before full-page captures and animation baselines exist at 1440×900 and 390×844 (1,260 samples each). Before click tests completed at knob x=890.5 and theme=1.

After-change Chrome execution was denied. Therefore after screenshots, rendered before/after equality, and full-sequence boundary checks are NOT completed. The calculated spacing has not been visually approved.

npm run build and npm run lint passed.

| Baseline | Initial | Final | Close-up |
|---|---|---|---|
| Desktop | [Initial](before-desktop-initial.png) | [Final](before-desktop-final.png) | [Close-up](before-desktop-closeup.png) |
| Narrow | [Initial](before-narrow-initial.png) | [Final](before-narrow-final.png) | [Close-up](before-narrow-closeup.png) |

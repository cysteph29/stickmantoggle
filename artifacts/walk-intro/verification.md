# Optional walk entrance

Preview: http://127.0.0.1:5175/?intro=walk
Default: http://127.0.0.1:5175/

Entrance duration: 1.12 seconds. Foot contacts: 0.28, 0.57, 0.89 seconds.
Hand reach blends from 0.66 seconds to the exact INITIAL_RIG at 1.12 seconds.
The character-only reveal mask is removed at 0.60 seconds. Theme stays light.

Review artifacts:
- `entrance.mp4`: actual browser playback, encoded with browser presentation timestamps.
- `contact-sheet.png`: reveal, three contacts, hand placement, exact handoff.
- `transition-into-push.png`: actual click sequence after handoff.
- `playback-review.png`: consecutive playback samples at 12 fps through the first push.
- `hidden.png`: alternate before clicking.

Verification:
- Default before/after: all 1,261 SVG/geometry/theme samples identical, covering 10.48 seconds at 120 Hz plus named poses.
- Raster comparison: 10 of 11 named default screenshots pixel-identical; landing-2 differs on 17 edge pixels (maximum channel delta 25), despite identical SVG attributes and joint transforms. This is a small rasterization variation, not a pose difference.
- Alternate after entrance: all 1,261 corresponding local push timestamps identical to baseline after stripping only the optional reveal wrapper and definitions.
- Maximum rendered ankle target error during entrance: 0.0096 screen pixels. Foot targets remain fixed during support; swing paths lift 11 stage units with smooth takeoff and landing.
- Forward knee bends, restrained opposing arms, gradual braking into stance. Reviewed captured playback frames for sliding and handoff continuity; no visible snap. Wrist-space reach avoids the knob-crossing arc found in the first iteration.
- Rapid repeated clicks: one active timeline before and after three additional clicks; same timeline identity.
- Reduced motion: character appears in initial stance and immediately uses the existing push behavior, without the entrance or mask.
- `npm run build`: passed.
- `npm run lint`: passed without warnings.

Implementation/removal:
`src/toggle/walkIntro.ts` owns all entrance motion. The only integration points are the query flag/callback in App.tsx and conditional character wrapper/mask in ToggleStage.tsx. Remove these and the module to remove the experiment. pushTimeline.ts, pushRig.ts, layout.ts, StickFigure.tsx, and styling are unchanged.

`compare.cjs` and `review.cjs` are local Playwright capture utilities (their dependency paths are specific to this workspace). Raw baseline and after samples are retained alongside the captures.

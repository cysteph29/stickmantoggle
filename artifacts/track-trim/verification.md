# Track trim verification

Chosen inward trim: **200 SVG units**, after an 80-unit preview still left excessive space.
Only `ToggleStage.tsx` changed: a separate visible right end at 938.5 instead of 1138.5. Left end 261.5, radius 180, center y 410, stroke 3, floor 588.5 and viewBox 0 0 1400 820 are unchanged.

Knob: x 509.5 → 890.5; travel 381; y 439; radius 148. Character initial hip: (300.14371981184263, 504.5). All exported layout values are recorded in before.json and after.json and match exactly.

Duration: **10.48 seconds**. Labels (identical):

```json
{
  "push1": 0.45,
  "recoil": 1.55,
  "step": 2.25,
  "push2": 3.25,
  "break": 4.45,
  "stumble": 4.65,
  "catch": 6.75,
  "settle": 7.15,
  "stand": 8.65,
  "rest": 10.48,
  "closeStance": 10
}
```

Compared 1,261 chronological samples at 120 Hz plus exact representative timestamps. The complete rendered SVG excluding only the track d attribute, and root theme styles, match exactly at every sample. This covers all character transforms, limb paths, knob coordinates, viewBox and theme progression. Animation source is unchanged.

Representative poses:

| Pose | Seconds | Before | After |
|---|---:|---|---|
| light-rest | 0.00 | [Before](before-light-rest.png) | [After](after-light-rest.png) |
| widest-push | 3.75 | [Before](before-widest-push.png) | [After](after-widest-push.png) |
| release | 4.50 | [Before](before-release.png) | [After](after-release.png) |
| landing-1 | 4.95 | [Before](before-landing-1.png) | [After](after-landing-1.png) |
| landing-2 | 5.47 | [Before](before-landing-2.png) | [After](after-landing-2.png) |
| landing-3 | 5.93 | [Before](before-landing-3.png) | [After](after-landing-3.png) |
| landing-4 | 6.75 | [Before](before-landing-4.png) | [After](after-landing-4.png) |
| catch | 7.15 | [Before](before-catch.png) | [After](after-catch.png) |
| stand-up | 9.25 | [Before](before-stand-up.png) | [After](after-stand-up.png) |
| dark-hold | 10.48 | [Before](before-dark-hold.png) | [After](after-dark-hold.png) |

All screenshots are full-page 1440×900 captures. The initial, widest-push and final poses were visually inspected. The right cap remains beyond all character poses; left-cap stance and all existing floor contacts are unchanged. No new character clipping is introduced.

At the final knob, the stroke-to-stroke horizontal clearance at knob-center height is approximately 74.65 units. Across the entire right semicircle, the minimum separation is approximately 7.45 units at the lower arc/flat-floor junction (sqrt(48² + 151²) − 149.5 − 1.5). The knob bottom remains at y 588.5, contacting the unchanged flat floor. The top and bottom track levels remain 230 and 590.

Validation: `npm run build` and `npm run lint` both exited 0.

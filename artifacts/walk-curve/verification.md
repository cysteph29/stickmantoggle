# Curved entrance revision

Alternate URL: http://127.0.0.1:5175/?intro=walk

## Composition

Knob offset: **−48 SVG units**, from x=509.5 to x=461.5 (about 44 CSS pixels at the desktop preview size). Final endpoint remains x=890.5. Vertical center and visible track geometry are unchanged.

The offset was selected using the empty toggle, curved reveal, hands-on pose, and widest stance. The widest rear plant is at x=160.14, on the elliptical cap; its ankle target follows the interior curve instead of hanging below it. Hip, torso, arms, grip, and front-foot mechanics retain the translated authored motion.

The character starts with its hip at x=42, beyond the track's leftmost x=81.5. It crosses a clip built from the actual track path. There is no fade or vertical reveal edge. Three contacts occur at 0.36, 0.72, and 1.02 seconds; hand contact completes at 1.20 seconds. Offstage feet remain occluded until crossing the curved floor. A 5-unit stroke-overflow allowance beneath the flat floor preserves the original ankle dots when the clip is removed; it does not alter the curved entrance boundary or track outline.

## Release and preservation

Alternate positioning is isolated in walkComposition.ts, walkIntro.ts, and walkPush.ts. The original timeline only gains an optional render callback whose default is the original applyRig function. No original pose keys, easing, timing, shared geometry, or theme keys changed.

Hip and airborne foot offsets use quintic correction curves with zero first and second derivatives at both ends. All character corrections end by the original stumble label (local 4.65 seconds). The knob correction finishes during the original 1.1-second release travel, preserving the final endpoint and adding distance without a velocity jump from the correction. The rear-foot floor adjustment ends during its original airborne kick-off.

## Checks

- Default: **1,261 / 1,261 matching SVG and theme samples**, including original baseline timestamps across the entire animation.
- Character from stumble onward: **703 / 703 exact matches** to the baseline.
- Full composition after knob release travel: **594 / 594 exact matches**.
- Actual React completion callbacks: default and alternate final DOM identical; final screenshots pixel-identical.
- Entrance foot targets: maximum rendered ankle error **0.000195 SVG units** at 120 Hz. Supporting targets remain fixed; swing targets lift 14 units.
- Entrance theme remains light; clip removed at handoff.
- Clip-on/off hand-contact comparison: no geometric clipping difference; 19 antialiased edge pixels vary slightly between browser rasterizations.
- Rapid repeat clicks during both entrance and push: one active timeline, same timeline identity.
- Reduced motion skips walking and starts the alternate push at x=461.5 with no clip.
- Actual browser playback captured at presentation timestamps; entrance and release frame sequences reviewed for curve clipping, foot contact, arm continuity, and release acceleration.
- `npm run build`: passed.
- `npm run lint`: passed without warnings.

## Review

- `contact-sheet.png`: empty composition, reveal, contacts, hands, widest push, release, stumble, final pose.
- `playback.mp4`: normal-speed browser recording through the release.
- `actual-final-default.png` / `actual-final-alternate.png`: completed compositions.
- `verify.cjs`: local browser verification utility; dependency paths are workspace-specific.

To remove the experiment, remove the three walk modules and their conditional App/ToggleStage integration, then remove the optional render callback from createPushTimeline. No shared geometry or original animation keys need reverting.

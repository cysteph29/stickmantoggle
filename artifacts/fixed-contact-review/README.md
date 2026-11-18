# Fixed-contact feasibility review — BLOCKED

No production files were changed. The comparison is current animation versus a rejected diagnostic, not a completed fix. Exit and stronger-push panels are unchanged current animation; no exit blend was implemented after feasibility failed. Final video exports were not regenerated.

## Timeline (seconds after walk contact)
- Settle/loading: 0–0.45.
- First-effort descent: 0.45–0.95.
- Low hold/tremor: 0.95–1.55.
- Recoil: 1.55; regroup: 2.25; stronger push starts: 3.25.

## Approved contacts, SVG stage units relative to knob center
- Near/left: (-147.832211, -7.045391).
- Far/right: (-146.264772, +20.796836).
- Initial actual lengths: near 33.269876 + 27.717986; far 27.707791 + 31.419973.

These are the rendered lengths, not the nominal 38 + 34 constants. The existing approved-contact helper changes lengths during entry, and both return to 38 + 34 at 0.95 seconds. The diagnostic retains that exact existing length schedule.

## Conflicts
1. Near contact is unreachable from 0.054–0.606 in a 1 ms scan. At 60 fps, affected sampled frames are 4–36 (0.066667–0.600000). The worst deficit occurs at 0.503: required reach 62.038928; available length 52.815128; deficit 9.223800. At the rendered 0.500 frame the deficit is 9.211770 (approximately).
2. Once reachable, preserving the initial near-arm elbow branch intersects the head. The first such captured reachable frame is 0.616667. At 0.95, the forearm passes 3.904983 units from the center of the 20-unit-radius head (16.095017 units inside the outline, before stroke width). This remains visibly intersecting through the low hold.
3. The alternative near elbow at 0.95 is ahead of its hand and switches bend side. It also grazes the head outline. It is not an acceptable continuous pushing solution.

## Smallest quantified relaxations (necessary bounds, not a complete valid fix)
At 0.503, reaching the fixed contact requires at least +9.223800 total link length, or moving the shoulder 9.223800 units toward the hand. Equality is straight-arm extension and does not satisfy the soft-elbow requirement. Preserving the link ratio with a 12-degree bend would require approximately +9.562264 total length. Neither small reach-only adjustment resolves the later head intersection.

With the low-hold arm placement fixed, clearing the near forearm at 0.95 requires at least 16.095017 units of head-center displacement, plus stroke clearance. This is a local geometric lower bound, not a proposed body-animation edit. Freezing the initial link lengths is also insufficient: the near arm would still be 6.338498 units short at 0.449.

Therefore the approved contact/body/length/continuous-elbow constraints cannot all hold. A follow-up needs authorization to revise the initial contact setup and/or shoulder/head trajectory and arm-length schedule. No such relaxation was silently applied. A globally smallest acceptable artistic relaxation has not been established.

## Evidence and limits
- `comparison.png`: full rendered character and knob; red/blue fixed initial-height guides and target circles.
- `fixed-contact-sequence.jpg`: sequential diagnostic excerpts; reach failures and head intersections are visible.
- `before/` and `fixed-contact-test/`: 226 PNGs each, sampled at 60 fps through 3.75 seconds.
- `feasibility.json`: 1 ms reach audit.
- `render-audit.json`: rendered wrist error and head-intersection checks.
- Visual inspection confirmed downward migration in current animation and gaps/intersections in the diagnostic. Length equality, contact offsets and reach deficits were numerically checked. The diagnostic uses the existing IK clamp on unreachable frames, visibly leaving a gap; those frames are rejected. Its 0.01-unit reach safety margin can also leave a subpixel gap very close to full extension.
- Normal-speed and slow playback were not available/reviewed. This is a sequential-frame feasibility review, not a completed motion review.

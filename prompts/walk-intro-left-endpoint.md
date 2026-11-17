# Walk intro: true left/off knob endpoint

Revise **only `?intro=walk`**. The current 48-unit leftward shift is insufficient: the empty toggle still looks like its knob is between states.

## Knob placement

**Place the initial knob at a true left/off endpoint.** Its clearance from the left curved wall should match—or closely resemble—the final knob’s clearance from the right curved wall.

- Derive the starting center by reflecting the final knob center across the visible track’s horizontal midpoint, then verify outline clearance.
- Preserve the knob’s radius, vertical position, and equal top/bottom gaps.
- Do not reserve enough left-side space to show the entire character. **The user explicitly accepts the character being partially outside the track and partially hidden during the entrance and early push.**
- Do not compromise the knob placement merely to preserve full-body visibility.

## Character staging

- Translate the approach and pre-release push consistently with the new knob position, maintaining hand contact and relative body mechanics.
- Reveal the character through the **actual curved track boundary**.
- Keep the character clipped while any part remains outside the track, including during the early push. Do not remove the mask at the walking-to-pushing handoff if that would suddenly expose the offstage body.
- Avoid visible feet below the track floor, mask popping, or body parts appearing through the outline.
- Preserve the existing final knob endpoint and blend smoothly into the established stumble, catch, breath, stand-up, and final stance.
- Review the longer knob travel and positional handoff for sudden acceleration or teleporting.

## Preserve the original

**Preserve the default URL completely.** Keep alternate offsets and clipping isolated. Do not change shared track geometry or default animation keys.

## Verify

1. Show the empty initial toggle beside the final dark state. Report left-start and right-final curve clearances.
2. Capture first emergence, hand contact, widest push, release, and the point where the character becomes fully visible.
3. Review normal-speed playback for clipping discontinuities, hand separation, and abrupt motion.
4. Confirm the default animation remains unchanged and the alternate retains the existing final composition.
5. Run `npm run build` and `npm run lint`.

**Priority: a convincing left/off knob position. Partial character visibility is intentional and acceptable.**

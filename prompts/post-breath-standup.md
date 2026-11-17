# Post-breath stand-up into dark-mode rest

Add a slow stand-up after the hands-on-knees catch so the page ends in a calm resting pose. Follow `prompts/animator-reviewer.md` for the persona and constraints.

## Why

The four-step stumble correctly ends bent over, hands on knees, one breath. That is the catch from almost falling. It is **not** a finished UI state. In dark mode the figure currently stays hunched, often with the head against the knob, while the footer links sit below. The visitor needs a settled character: upright enough to read as "done," still soft from the effort.

## What to change

File: `src/toggle/pushTimeline.ts` (four-step / `four` branch only). Keep everything through the catch and the existing breath cycle.

After the breath returns to the catch pose:

1. **Append the rise at `settle+=1.5`**, after the entire existing exhale (currently the 8.65s endpoint). Stand up slowly over about 1.2s (`sine.inOut` or similar), with any arm/head settling complete by about 10.05s. Add `stand` and `rest` labels.
2. **Final rest pose:**
   - Torso finishes at `0°`: visibly straight upright, as Cyril requested. Ease into vertical without an overshoot.
   - Chest about `0`.
   - Head finishes about `0°`, balanced above the shoulders, looking forward. Let it follow the torso with a slight delay, then settle.
   - Soft knees, about `8–15°` of bend; compute hip height from the two-bone geometry and planted feet. Do not impose a separate leg-length percentage, which would conflict with this bend target.
   - Hip x stays between the feet (midpoint ± a few px), never behind the back foot.
   - Keep the existing ~44px split stance (or a slightly narrower calm stance, ~36–44px). Do not bring the feet together into a pencil stand.
3. **Arms:** leave the thighs during the rise and hang loosely at the sides (slight forward hang is fine). Use `reachArm` or free arm angles so they don't clip the torso. No hands-on-hips. No overhead poses.
4. **Clearance:** at every frame of the stand-up and in the final hold, keep at least ~20px between the head circle and the knob outline. If needed, bias the final hip a little further from the knob (further left on stage).
5. **Theme:** already at 1 by `catch`. Do not retween `--theme`.
6. **Duration:** total timeline can grow by ~1.0–1.4s. That is expected.

## Hard rules

- Both knees always bend toward +x.
- Do not revive the old locked-knee hands-on-hips ending.
- Do not change the push, recoil, break, stumble steps, catch fold, or breath content — only append after the breath.
- Six-step path: leave alone unless it shares code that must stay consistent.

## Verify

1. Contact sheet from ~6.5s through the new end (catch → breath → stand → hold).
2. Final frame: figure straight upright with soft knees, head clear of the knob, arms down, dark theme, links still visible.
3. Confirm no knee flips; run existing probes if present (`.frames/legs.ts`).
4. Screenshots: light rest, dark final hold. `npm run build`.

## Review evidence

The current four-step timeline ends at 8.65s immediately after returning to the catch pose; there is no stand-up tween. Reviewed the saved ending contact sheet and dark-mode hold screenshot. The dark hold already shows head/knob separation, so preserve that clearance rather than assume overlap. Fresh offline seeking of the current source confirms the 8.65s duration. Preserve all animation up to that endpoint.

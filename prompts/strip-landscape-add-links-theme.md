# Strip landscape, add social links, wire light→dark theme

Drop the hatched landscape. The page should be the paper background, the centered toggle, and three social links at the bottom center of the viewport. Then add the light-to-dark theme flip timed to the push animation.

## 1. Remove the landscape

- Delete `src/components/Landscape.tsx` and any landscape-only helpers, hooks, or measurement code (track-floor measuring, resize observers used only for the landscape, etc.).
- Remove the landscape layer from the page layout in `App.tsx` / `ToggleStage.tsx` / CSS. No fixed full-bleed SVG behind the stage.
- Clean up CSS: remove landscape-only classes and restore a simple centered stage on the paper background. Keep the debug panel as a top-left overlay when `?debug` is present; don't push the stage down.
- Keep the toggle SVG, stick figure, and push animation exactly as they are. Joint markers stay off unless `?debug`.

After this step the page is: paper, centered toggle with the figure, nothing else drawn.

## 2. Social links

Add a footer row fixed to the **bottom center of the viewport** (not below the SVG in document flow). Three text links, same ink as the figure, quiet and small:

| Label | URL |
|---|---|
| GitHub | https://github.com/cysteph29 |
| LinkedIn | https://www.linkedin.com/in/cyril-stephen |
| X | https://x.com/cyril_design |

Requirements:
- Labels: `GitHub`, `LinkedIn`, `X` (or `Twitter/X` if you prefer matching the portfolio; default to `X`).
- Open in a new tab (`target="_blank"` + `rel="noopener noreferrer"`).
- Horizontal row, evenly spaced or with a small gap / middot separators. Centered horizontally, about 24–40px from the bottom edge of the viewport.
- Use `var(--ink)`. No pills, no cards, no icons unless you can keep them as pure 1px line marks that match the stick figure. Prefer plain text.
- Links must stay readable and clickable above the page; `pointer-events` on the stage SVG must not block them.
- No title. No other chrome.

## 3. Theme tokens

In `src/index.css`, drive colors from `--theme` (0 = light, 1 = dark):

**Light (current):**
- `--paper #f3f3f1`
- `--track #e4e4e0`
- `--knob #fbfbfa`
- `--ink #1c1c1c`
- `--line #c8c8c4`

**Dark:**
- `--paper #14161b`
- `--track #1d2027`
- `--knob #262a32`
- `--ink #ece9e2`
- `--line #3a3e47`

Blend each token with `color-mix` (or JS writing the five vars onto `document.documentElement`) so the whole page — paper, track, knob, figure, eye, joints, and the social links — flips together. Replace any leftover hardcoded colors.

## 4. Time the theme to the push

In `src/toggle/pushTimeline.ts`, animate a `theme` value 0→1 and write it to `--theme` in the same `onUpdate` that calls `applyRig`:

- Hold at 0 until the `break` label.
- From `break` to `catch`, tween to 1 with `power1.inOut`.
- Hold at 1 through the end.

Also in `src/App.tsx` / timeline:
- **Reset** and debug knob-side controls: set `--theme` instantly to 0 for left, 1 for right.
- **`prefers-reduced-motion: reduce`:** snap theme to 1 at `catch` instead of crossfading.

Don't change any poses, timings, or the rig.

## Out of scope

- No landscape, no title, no new characters, no reverse (dark→light) animation.
- Don't restyle the toggle or restyle the stick figure.

## Verify

1. Screenshot at rest (light): paper only, centered toggle, three links bottom-center, no landscape, no joint markers, no debug panel.
2. Screenshot mid-push (theme ~0.5) and at the hands-on-knees hold (theme = 1).
3. Confirm links work and aren't covered by the stage.
4. Confirm `?debug` still shows the panel and joints.
5. Run `npm run build`.

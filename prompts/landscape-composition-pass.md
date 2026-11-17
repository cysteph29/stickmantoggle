# Landscape composition pass

Composition pass on the hatched landscape (`src/components/Landscape.tsx` and the layer setup around it). The layout is correct now: full-bleed, toggle centered, grass meeting the track floor. Keep all of that. The scene still reads as two flat textures instead of a landscape. The reference images `prompts/reference-cabin.jpg` and `prompts/reference-sharks.png` show the target style; open them before starting. Fix these:

1. **Hide the debug joint markers outside debug mode.** The joint marker circles are visible on the normal page. `showJoints` should default to false and only be on when the URL has `?debug`.

2. **Bring the hills up above the toggle.** Right now the far ridge and near hills sit below the top of the track, so they only show as slivers at the left and right edges. Raise them so they're clearly visible *above* the track at every viewport size:
   - The far ridge peaks should sit about 60 to 140px above the track's top edge on screen, as a soft wavy line with 2 to 3 peaks across the width.
   - One near hill should rise behind the toggle, peaking about 20 to 60px above the track top and overlapping the far ridge, so there are two clear depth layers.

   Anchor them to the measured track position, as the grass already is.

3. **Make the grass recede.** The grass is currently identical tufts at one density across the whole bottom of the screen, which makes it the loudest element. Change it like this:
   - Near the track floor (in the distance), use short tufts, 3 to 5px tall, tightly packed.
   - Toward the bottom of the screen (up close), make the tufts gradually taller (up to about 14px) and more widely spaced, organized in loose horizontal rows.
   - Break it up with 2 to 3 irregular bands or patches of bare paper running across, so it isn't a uniform field.
   - Overall it should read as lighter than the hills.

4. **Give the sky rhythm.** Keep vertical strokes, but widen the spacing to about 8 to 9px and add 2 wavy cloud breaks: thin bands of bare paper, 6 to 12px wide, that wander horizontally across the sky, as in the cabin reference. The sun cutout stays where it is.

5. **Hierarchy:** the stick figure and toggle must stay the strongest elements on screen. If anything in the landscape competes with them, make that element lighter (opacity or spacing), not the figure heavier.

**Out of scope:** the toggle, the figure, the animation, any dark mode or theme work, and the layer and layout system you just built.

**Verify:** take screenshots at 1440×900, 1920×1080 and 900×1200, without `?debug`. Confirm there are no joint markers, the hills are visible above the track, the grass recedes, and the sky has cloud breaks. Run `npm run build`.

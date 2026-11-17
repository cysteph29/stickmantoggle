# Horizontal centering verification

Fixed presentation wrapper translation: +100 SVG units horizontally, 0 vertically. Derived from track bounds 81.5–1118.5 (center 600), against viewBox center 700. Track path, all internal coordinates and scale remain unchanged.

## Desktop (1440×900)

1,260 samples compared at 120 Hz plus exact representative timestamps over 10.48 seconds. Character and knob markup, track path, theme, duration and labels identical. SVG box, scale and footer rectangle identical. Every character/knob screen position moves by the same fixed offset; y is unchanged. All sampled bounds, including a conservative stroke allowance, remain inside the SVG and page throughout widest push and stumble.

Margins: 244.58 px left / 244.58 px right, unchanged throughout playback. Actual pointer click starts the animation and reaches knob x=890.5, theme=1.

| Pose | Before | After |
|---|---|---|
| initial | [Before](before-desktop-initial.png) | [After](after-desktop-initial.png) |
| widest-push | [Before](before-desktop-widest-push.png) | [After](after-desktop-widest-push.png) |
| stumble | [Before](before-desktop-stumble.png) | [After](after-desktop-stumble.png) |
| final | [Before](before-desktop-final.png) | [After](after-desktop-final.png) |
## Narrow (390×844)

1,260 samples compared at 120 Hz plus exact representative timestamps over 10.48 seconds. Character and knob markup, track path, theme, duration and labels identical. SVG box, scale and footer rectangle identical. Every character/knob screen position moves by the same fixed offset; y is unchanged. All sampled bounds, including a conservative stroke allowance, remain inside the SVG and page throughout widest push and stumble.

Margins: 67.97 px left / 67.97 px right, unchanged throughout playback. Actual pointer click starts the animation and reaches knob x=890.5, theme=1.

| Pose | Before | After |
|---|---|---|
| initial | [Before](before-narrow-initial.png) | [After](after-narrow-initial.png) |
| widest-push | [Before](before-narrow-widest-push.png) | [After](after-narrow-widest-push.png) |
| stumble | [Before](before-narrow-stumble.png) | [After](after-narrow-stumble.png) |
| final | [Before](before-narrow-final.png) | [After](after-narrow-final.png) |

Build and lint: both passed.

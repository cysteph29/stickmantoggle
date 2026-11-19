# Uniform variant verification

URL: http://127.0.0.1:5175/?variant=uniform

Shared ToggleStage and StickFigure; no animation changes. Default track and styles retained. Uniform limbs use 3-unit strokes with round caps and 1.5-unit joint dots.

Settled knob center (890.5, 434), radius 148; right cap center (890.5, 434), radius 156. Both outlines are 3 units thick. Visible gap = 156 - 1.5 - (148 + 1.5) = 5 units at top, bottom, and right. Left boundary and composition translation remain unchanged.

Direct navigation and refresh passed. Default DOM, track geometry, poses and themes match the pre-edit baseline. Both variants match across 120 animation samples. Initial and completed baseline captures are pixel-identical; strongest-push comparison differs at one rasterized pixel. Build passed.

| State | Default | Uniform |
| --- | --- | --- |
| Initial | [capture](default-initial.png) | [capture](uniform-initial.png) |
| Strongest push | [capture](default-strongest-push.png) | [capture](uniform-strongest-push.png) |
| Completed | [capture](default-completed.png) | [capture](uniform-completed.png) |

The initial character is hidden, as in the existing animation. Joint styling is invariant through all poses; circles match the round stroke caps. Captures reviewed visually.

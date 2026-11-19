# Expanded uniform toggle

URL: http://127.0.0.1:5175/?variant=uniform

The track centerline now spans y=271 to 597. Its right cap has radius 163 and center (890.5,434), concentric with the settled 148-radius knob. With both strokes at 3 units, the visible gap is 163 - 1.5 - 148 - 1.5 = 12 units at top, bottom and right. The leftmost boundary and composition translation remain unchanged. The entrance clip uses the expanded outline.

Uniform-only pose adaptation lowers the foot targets by 7, minimally lowers the hip where required for leg reach, and shortens the backward bracing step by up to 14 units. Torso and arm IK preserve authored pushing wrist positions without stretching limbs. Knob geometry, travel, timeline and theme code are unchanged.

Verification: direct navigation and refresh; 120 sampled animation frames; default DOM and geometry agree with the pre-edit baseline (numeric comparison to four decimal places); theme values match. Planted foot height error <0.00003 units, pushing wrist displacement <0.00002 units. All outlines/limbs remain 3 units. Build passed. Captures visually reviewed.

- [Entrance](uniform-entrance.png)
- [First effort](uniform-first-effort.png)
- [Strongest push](uniform-strongest-push.png)
- [Recovery](uniform-recovery.png)
- [Final rest](uniform-completed.png)

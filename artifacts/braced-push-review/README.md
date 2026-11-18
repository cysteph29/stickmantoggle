# Upper-body retry: remaining arm-length conflict

Production code remains unchanged. `comparison.png` is a rejected maximum-reach diagnostic, not an implemented after.

The requested connected upper-body adjustment cannot satisfy the inherited length schedule. Hip-to-shoulder reach is at most 30 + 22 = 52 SVG units, regardless of torso/chest angles. At 0.522 seconds the fixed near contact is 109.283786 units from the protected hip. The rendered upper arm is 21.765919 and forearm 30.602487, giving a maximum combined hip-to-hand reach of 104.368405. The shortfall is 4.915381 even with every segment aligned and straight. Flexion only reduces reach. Head adjustments cannot change this bound.

The impossibility interval is 0.476–0.597 seconds in a 1 ms scan (60-fps frames 29–35). This is within the first-effort descent, 0.45–0.95; the low hold lasts through 1.55 and stronger push starts at 3.25.

The inherited walkContactArms helper shortens/re-expands the links as it offsets the elbow. The smallest necessary reach relaxation is at least 4.915381 additional combined arm-length units at the worst frame, with more required for flexion and head clearance. It is not authorized by the new torso/head-only permission.

A more coherent proposed relaxation is to remove that inherited compression and keep the approved initial links constant through the first effort: near 33.269876 / 27.717986; far 27.707791 / 31.419973. Constrained numerical trials at 0.500, 0.525 and 0.950 found reachable, head-clear connected torso/head poses with these fixed lengths. This is only a feasibility check, not a completed animation or continuous-path verification. Restoring exact approved links and poses through regroup still needs implementation and review.

Initial fixed contacts relative to knob center: near (-147.832211,-7.045391), far (-146.264772,+20.796836).

Evidence: `chain-bound.json` contains the exact reach bound. The comparison and 21 sampled frames per version show the current animation and maximum-reach diagnostic with fixed reference marks. At later panels the diagnostic is unchanged production, not a new exit blend. No final video exports were regenerated. Normal/slow playback was not reviewed. The maximum-reach pose is visibly rejected; upper-body freedom alone cannot close the marked gap.

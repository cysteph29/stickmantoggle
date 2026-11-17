/** Coordinates for the opt-in entrance only; shared geometry stays untouched. */
import { TRACK_LEFT, TRACK_RIGHT, TRACK_RADIUS, KNOB_RIGHT_X } from './layout.ts'
import { INITIAL_RIG, type PushRig } from './pushRig.ts'

// Mirror the final center across the visible outline, including its shortened
// right end. These describe the existing outline, not new track geometry.
export const WALK_TRACK_LEFT = TRACK_LEFT - TRACK_RADIUS
export const WALK_TRACK_RIGHT = TRACK_RIGHT - 248 + TRACK_RADIUS
// Give the head and upper torso more room inside the curved reveal.
export const WALK_KNOB_START = WALK_TRACK_LEFT + WALK_TRACK_RIGHT - KNOB_RIGHT_X + 50
export const WALK_OFFSET_X = WALK_KNOB_START - INITIAL_RIG.knobX
export const WALK_REST: PushRig = {
  ...INITIAL_RIG,
  hipX: INITIAL_RIG.hipX + WALK_OFFSET_X,
  knobX: WALK_KNOB_START,
  frontFootX: INITIAL_RIG.frontFootX + WALK_OFFSET_X,
  backFootX: INITIAL_RIG.backFootX + WALK_OFFSET_X,
}

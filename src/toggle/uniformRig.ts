import { SHIN_LENGTH, THIGH_LENGTH } from './layout.ts'
import type { PushRig } from './pushRig.ts'

export const UNIFORM_EXPANSION = 7
export const isUniform = (svg: SVGSVGElement) => svg.classList.contains('stage-svg--uniform')

/** Lower foot targets, retaining the authored hip wherever the legs can reach.
 * A small smooth reach margin avoids a knee snapping straight at the limit. */
export function uniformRig(rig: PushRig): PushRig {
  // Shorten the authored backward bracing step just enough for the deeper
  // floor. This settles with that step and stays fixed through the push.
  const stance = Math.min(1, Math.max(0, (rig.frontFootX - rig.backFootX - 65) / 35))
  rig = { ...rig, backFootX: rig.backFootX + 14 * stance * stance * (3 - 2 * stance) }
  const reach = THIGH_LENGTH + SHIN_LENGTH - 0.1
  const hipX = rig.hipX + rig.drive
  const minimumHip = Math.max(...[
    [rig.frontFootX, rig.frontFootY], [rig.backFootX, rig.backFootY],
  ].map(([x, y]) => y + UNIFORM_EXPANSION - Math.sqrt(Math.max(1, reach ** 2 - (x - hipX) ** 2))))
  const needed = minimumHip - rig.hipY
  // Smooth max(0, needed) over one unit; otherwise leave the hip untouched.
  const drop = needed <= -0.5 ? 0 : needed >= 0.5 ? needed : (needed + 0.5) ** 2 / 2
  return { ...rig, hipY: rig.hipY + drop,
    frontFootY: rig.frontFootY + UNIFORM_EXPANSION,
    backFootY: rig.backFootY + UNIFORM_EXPANSION }
}

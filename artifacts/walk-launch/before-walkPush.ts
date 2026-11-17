/** Alternate positioning adapter. Authored poses and timing remain in pushTimeline. */
import { applyRig, type PushRig } from './pushRig.ts'
import { createPushTimeline } from './pushTimeline.ts'
import { WALK_OFFSET_X, WALK_REST } from './walkComposition.ts'

const release = 4.45
// Zero velocity and acceleration at both ends of each positional correction.
function remaining(time: number, start: number, duration: number) {
  const u = Math.min(1, Math.max(0, (time - start) / duration))
  return 1 - u ** 3 * (10 - 15 * u + 6 * u * u)
}

export function alternatePushRig(rig: PushRig, time: number): PushRig {
  if (time >= release + 0.3) return rig
  // Translate the complete pose together: no changed knee geometry or hand
  // separation. Finish during the first airborne lunge, before its foot plant.
  const bodyOffset = WALK_OFFSET_X * remaining(time, release, 0.22)
  return {
    ...rig,
    hipX: rig.hipX + bodyOffset,
    frontFootX: rig.frontFootX + bodyOffset,
    backFootX: rig.backFootX + bodyOffset,
    knobX: rig.knobX + WALK_OFFSET_X * remaining(time, release, 0.3),
  }
}

export function createWalkPushTimeline(svg: SVGSVGElement, onComplete: (rig: PushRig) => void) {
  svg.getElementById('walk-actor')?.setAttribute('clip-path', 'url(#walk-reveal)')
  applyRig(svg, WALK_REST)
  return createPushTimeline(svg, onComplete, (stage, rig, time) => {
    applyRig(stage, alternatePushRig(rig, time))
    const actor = stage.getElementById('walk-actor')
    // By this point the original lunge is inside the flat span, including
    // all limb strokes. Keep the silhouette clip throughout the early push.
    if (time < release + 0.24) actor?.setAttribute('clip-path', 'url(#walk-reveal)')
    else actor?.removeAttribute('clip-path')
  })
}

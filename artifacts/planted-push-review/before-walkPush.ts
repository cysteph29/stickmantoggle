/** Alternate positioning adapter. Authored poses and timing remain in pushTimeline. */
import { applyRig, type PushRig } from '../../src/toggle/pushRig.ts'
import { createPushTimeline } from '../../src/toggle/pushTimeline.ts'
import { walkDescentArms } from './before-walkDescentArms.ts'
import { applyWalkContactArms } from '../../src/toggle/walkContactArms.ts'
import { WALK_OFFSET_X, WALK_REST } from '../../src/toggle/walkComposition.ts'

const release = 4.45
// The knob alone sheds its offset to reach the shared right endpoint.
function remaining(time: number, start: number, duration: number) {
  const u = Math.min(1, Math.max(0, (time - start) / duration))
  return 1 - u ** 3 * (10 - 15 * u + 6 * u * u)
}

export function alternatePushRig(rig: PushRig, time: number): PushRig {
  // A constant translation preserves every stride and planted support foot.
  // The alternate keeps its own recovery path and resting position.
  const bodyOffset = WALK_OFFSET_X
  // Flatten the rise between landings two and three, leaving a smaller
  // compression into the third plant. Lowering the high point adds leg
  // reach margin instead of pulling either planted foot beyond its reach.
  // C2 blends preserve landing two and rejoin before the drag starts.
  const stepTime = time - (release + 0.2)
  const hipSettle = stepTime > 0.9 && stepTime < 1.46
    ? 1.5 * (stepTime < 1.18
      ? 1 - remaining(stepTime, 0.9, 0.28)
      : remaining(stepTime, 1.18, 0.28))
    : 0
  return {
    ...rig,
    hipX: rig.hipX + bodyOffset,
    hipY: rig.hipY + hipSettle,
    frontFootX: rig.frontFootX + bodyOffset,
    backFootX: rig.backFootX + bodyOffset,
    knobX: rig.knobX + WALK_OFFSET_X * remaining(time, release, 0.3),
  }
}

export function createWalkPushTimeline(svg: SVGSVGElement, onComplete: (rig: PushRig) => void) {
  svg.getElementById('walk-actor')?.setAttribute('clip-path', 'url(#walk-reveal)')
  applyRig(svg, WALK_REST)
  const timeline = createPushTimeline(svg, (rig) => {
    // Reconcile the translated endpoint too, so React cannot move it back.
    onComplete(alternatePushRig(rig, Infinity))
  }, (stage, rig, time) => {
    const positioned = alternatePushRig(rig, time)
    const arms = walkDescentArms(positioned, time, remaining(time, 0.45, 0.5))
    applyRig(stage, positioned)
    // Keep the approved contact; the descent correction persists through
    // recoil/regroup and rejoins the exact stronger push at 3.25s.
    applyWalkContactArms(stage, positioned, remaining(time, 0.45, 0.5), arms)
    const actor = stage.getElementById('walk-actor')
    // Retain the curved reveal through the recovery. At the settled catch
    // the translated silhouette is wholly inside the flat track span.
    if (time < timeline.labels.settle) actor?.setAttribute('clip-path', 'url(#walk-reveal)')
    else actor?.removeAttribute('clip-path')
  })
  return timeline
}

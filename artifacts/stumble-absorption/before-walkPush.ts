/** Alternate positioning adapter. Authored poses and timing remain in pushTimeline. */
import { applyRig, type PushRig } from './pushRig.ts'
import { createPushTimeline } from './pushTimeline.ts'
import { WALK_OFFSET_X, WALK_REST } from './walkComposition.ts'

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
  const timeline = createPushTimeline(svg, (rig) => {
    // Reconcile the translated endpoint too, so React cannot move it back.
    onComplete(alternatePushRig(rig, Infinity))
  }, (stage, rig, time) => {
    applyRig(stage, alternatePushRig(rig, time))
    const actor = stage.getElementById('walk-actor')
    // Retain the curved reveal through the recovery. At the settled catch
    // the translated silhouette is wholly inside the flat track span.
    if (time < timeline.labels.settle) actor?.setAttribute('clip-path', 'url(#walk-reveal)')
    else actor?.removeAttribute('clip-path')
  })
  return timeline
}

/** Alternate positioning adapter. Authored poses and timing remain in pushTimeline. */
import { applyRig, INITIAL_RIG, type PushRig } from './pushRig.ts'
import { createPushTimeline } from './pushTimeline.ts'
import { WALK_OFFSET_X, WALK_REST } from './walkComposition.ts'

const release = 4.45

/** Alternate-only absorption, in seconds from stumble. Positive y is down. */
function absorptionHip(rig: PushRig, time: number) {
  const s = time - (release + 0.2)
  // Preserve the release/first catch and rejoin before the final drag rises.
  if (s <= 0.62 || s >= 1.48) return rig.hipY
  const keys = [
    [0.62, 14],
    [0.9, 23], // Second contact .82: finish absorbing 80ms later, 3px deeper.
    [1.18, 19], // Stay loaded instead of springing all the way back up.
    [1.36, 20], // Third contact 1.28: only 1px of recovery-leg compression.
    [1.48, 20], // Hold the weight, then join the existing drag at zero velocity.
  ]
  for (let i = 1; i < keys.length; i++) {
    const [end, y] = keys[i]
    if (s <= end) {
      const [start, previous] = keys[i - 1]
      const u = (s - start) / (end - start)
      const eased = (1 - Math.cos(Math.PI * u)) / 2
      return INITIAL_RIG.hipY + previous + (y - previous) * eased
    }
  }
  return rig.hipY
}
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
    hipY: absorptionHip(rig, time),
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

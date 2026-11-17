/** Optional, disposable entrance. Authored push poses stay in the original timeline. */
import gsap from 'gsap'
import { handLocal } from './layout.ts'
import { applyRig, reachArm, rigToPose, type PushRig } from './pushRig.ts'

import { WALK_REST } from './walkComposition.ts'

export const WALK_DURATION = 1.2
const smooth = (u: number) => u * u * (3 - 2 * u)
const mix = (a: number, b: number, u: number) => a + (b - a) * u
const progress = (t: number, start: number, end: number) =>
  Math.min(1, Math.max(0, (t - start) / (end - start)))

/** Contact-space gait: only the swinging foot moves; both knees bend forward. */
export function sampleWalk(t: number): PushRig {
  const r = WALK_REST
  if (t >= WALK_DURATION) return { ...r }
  const settle = smooth(progress(t, 0.74, WALK_DURATION))
  const travel = Math.min(1, t / WALK_DURATION)
  const hipX = mix(r.hipX - 210, r.hipX, Math.sin(travel * Math.PI / 2))
  const swing = (from: number, to: number, start: number, end: number) => {
    const u = progress(t, start, end)
    return {
      x: mix(from, to, smooth(u)),
      y: r.frontFootY - 14 * Math.sin(Math.PI * u) ** 2,
    }
  }
  const first = swing(r.hipX - 182, r.hipX - 67, 0, 0.36)
  const back = swing(r.hipX - 172, r.backFootX, 0.36, 0.72)
  const front = t < 0.73 ? first : swing(r.hipX - 67, r.frontFootX, 0.73, 1.02)
  const stride = Math.sin(t / 0.36 * Math.PI) * (1 - settle)
  // Keep both legs reachable as support transfers from offstage to the floor.
  const highestHip = Math.max(
    front.y - Math.sqrt(Math.max(1, 92 ** 2 - (front.x - hipX) ** 2)),
    back.y - Math.sqrt(Math.max(1, 92 ** 2 - (back.x - hipX) ** 2)),
  )
  const rig: PushRig = {
    ...r,
    hipX,
    hipY: mix(highestHip + 1.5, r.hipY, settle),
    torso: mix(-3, r.torso, settle),
    head: mix(3, r.head, settle),
    frontFootX: front.x,
    frontFootY: front.y,
    backFootX: back.x,
    backFootY: back.y,
    upperArmLeft: 12 - 13 * stride,
    forearmLeft: 16,
    upperArmRight: 8 + 13 * stride,
    forearmRight: 12,
    grip: 0,
  }
  // Reach in wrist space: an angle blend can arc through the knob surface.
  const contact = rigToPose(r)
  const reach = smooth(progress(t, 0.77, WALK_DURATION))
  for (const side of ['Left', 'Right'] as const) {
    const upper = `upperArm${side}` as const
    const fore = `forearm${side}` as const
    const from = handLocal(rig[upper], rig[fore], rig.torso)
    const to = handLocal(contact[upper], contact[fore], r.torso)
    const arm = reachArm(rig, side === 'Left' ? 'near' : 'far', {
      x: mix(rig.hipX - from.x, r.hipX - to.x, reach),
      y: mix(rig.hipY + from.y, r.hipY + to.y, reach),
    })
    rig[upper] = arm.upper
    rig[fore] = arm.fore
  }
  return rig
}

export function prepareWalk(svg: SVGSVGElement) {
  const actor = svg.getElementById('walk-actor')
  actor?.setAttribute('opacity', '0')
  actor?.removeAttribute('clip-path')
}

export function createWalkIntro(svg: SVGSVGElement, onComplete: () => void) {
  const actor = svg.getElementById('walk-actor')
  const clock = { time: 0 }
  const render = () => {
    applyRig(svg, sampleWalk(clock.time))
    actor?.setAttribute('opacity', '1')
    // Offstage visibility is intentional, including after hand contact.
    actor?.setAttribute('clip-path', 'url(#walk-reveal)')
  }
  render()
  return gsap.timeline({ onComplete }).to(clock, {
    time: WALK_DURATION,
    duration: WALK_DURATION,
    ease: 'none',
    onUpdate: render,
  })
}

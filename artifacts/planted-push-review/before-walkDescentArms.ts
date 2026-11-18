/** Walk-only contact path; the timeline and approved bone-length blend stay intact. */
import { KNOB_RADIUS, KNOB_Y, limbEnd, rotate, shoulderLocal, solveTwoBone } from '../../src/toggle/layout.ts'
import { type PushRig } from '../../src/toggle/pushRig.ts'
import { walkContactArms } from '../../src/toggle/walkContactArms.ts'

const smooth = (time: number, start: number, end: number) => {
  const u = Math.min(1, Math.max(0, (time - start) / (end - start)))
  return u ** 3 * (10 - 15 * u + 6 * u * u)
}
const surface = (y: number) => -Math.sqrt(Math.max(0, KNOB_RADIUS ** 2 - y ** 2))

export function walkDescentArms(rig: PushRig, time: number, contactWeight: number) {
  const arms = walkContactArms(rig, contactWeight)
  if (time <= 0.48 || time >= 3.25) return arms
  const entry = smooth(time, 0.48, 0.68)
  const exit = smooth(time, 2.65, 3.25)
  const angle = rig.torso + rig.chest
  const shoulder = shoulderLocal(rig.chest)
  const shoulderY = rig.hipY + rotate(shoulder.x, shoulder.y, rig.torso).y
  return arms.map((arm) => {
    const e = limbEnd(arm.upperLength, arm.upper + angle)
    const f = limbEnd(arm.foreLength, arm.upper + arm.fore + angle)
    const wrist = { x: -e.x - f.x, y: e.y + f.y }
    const dy = shoulderY + wrist.y - KNOB_Y
    const target = 3
    // Retain a soft elbow wherever the approved pose has one. At the final
    // wind-up, the allowed bend converges to that exact authored extension.
    const minBend = Math.min(12, Math.abs(arm.fore)) * Math.PI / 180
    const maxReach = Math.sqrt(arm.upperLength ** 2 + arm.foreLength ** 2
      + 2 * arm.upperLength * arm.foreLength * Math.cos(minBend))
    const candidate = (slide: number) => {
      const x = wrist.x + surface(dy + slide) - surface(dy)
      const y = wrist.y + slide
      if (Math.hypot(x, y) > maxReach + 1e-7) return undefined
      const local = rotate(-x, y, -angle)
      const solved = solveTwoBone(arm.upperLength, arm.foreLength, local.x, local.y, 1)
      const fore = limbEnd(arm.foreLength, solved.upper + solved.lower + angle)
      if (-fore.x <= 0) return undefined
      return { solved, error: (fore.y - target) ** 2 + slide * 1e-7 }
    }
    // Search only reachable contacts, avoiding a clamped IK wrist that would
    // float off the surface. Separate contacts retain the hand stagger.
    let bestSlide = 0
    let bestError = (f.y - target) ** 2
    for (let slide = 0.25; slide <= 80; slide += 0.25) {
      const c = candidate(slide)
      if (c && c.error < bestError) { bestError = c.error; bestSlide = slide }
    }
    let lo = Math.max(0, bestSlide - 0.25)
    let hi = bestSlide + 0.25
    for (let i = 0; i < 24; i++) {
      const a = lo + (hi - lo) / 3
      const b = hi - (hi - lo) / 3
      if ((candidate(a)?.error ?? Infinity) < (candidate(b)?.error ?? Infinity)) hi = b
      else lo = a
    }
    const slide = (lo + hi) / 2
    const c = candidate(slide * entry * (1 - exit))
    if (!c || slide < 1e-4) return arm
    return { ...arm, upper: c.solved.upper, fore: c.solved.lower }
  })
}

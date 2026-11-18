/** Planted first effort, isolated from the shared push timeline. */
import { KNOB_RADIUS, KNOB_Y, limbEnd, rotate, shoulderLocal } from './layout.ts'
import { type PushRig } from './pushRig.ts'
import { WALK_REST } from './walkComposition.ts'
import { walkContactArms } from './walkContactArms.ts'

const smooth = (time: number, start: number, end: number) => {
  const u = Math.min(1, Math.max(0, (time - start) / (end - start)))
  return u ** 3 * (10 - 15 * u + 6 * u * u)
}
const mix = (a: number, b: number, u: number) => a + (b - a) * u
const rad = Math.PI / 180
const initialArms = walkContactArms(WALK_REST, 1)
// Exact authored endpoint immediately before push2 (3.25s).
const strong: PushRig = {
  ...WALK_REST, hipX: WALK_REST.hipX - 24, hipY: WALK_REST.hipY + 22,
  torso: -40, chest: -4, head: 40, gripDrop: -4, gripSpread: 0,
}
const strongArms = walkContactArms(strong, 0)
const surface = (y: number) => -Math.sqrt(Math.max(0, KNOB_RADIUS ** 2 - y * y))
const shoulderAt = (r: PushRig) => {
  const s = shoulderLocal(r.chest)
  const p = rotate(s.x, s.y, r.torso)
  return { x: r.hipX + r.drive - p.x, y: r.hipY + p.y }
}
function contacts(r: PushRig, arms: typeof initialArms) {
  const s = shoulderAt(r)
  return arms.map(a => {
    const e = limbEnd(a.upperLength, a.upper + r.torso + r.chest)
    const f = limbEnd(a.foreLength, a.upper + a.fore + r.torso + r.chest)
    return { x: s.x - e.x - f.x - r.knobX, y: s.y + e.y + f.y - KNOB_Y }
  })
}
const planted = contacts(WALK_REST, initialArms)
const released = contacts(strong, strongArms)

export function walkDescentArms(input: PushRig, time: number) {
  if (time >= 3.2) return { rig: input, arms: walkContactArms(input, 0) }
  if (time <= 0) return { rig: input, arms: initialArms }
  // Both wrists remain fixed relative to the knob through the complete hold.
  // Regroup slides directly to the approved high push2 contacts, never via
  // the old low-hand keys. Link lengths stay constant until recoil begins.
  const release = smooth(time, 1.55, 2.65)
  const grow = smooth(time, 1.55, 2.25)
  const finish = smooth(time, 3.05, 3.2)
  const authoredArms = finish ? walkContactArms(input, 0) : strongArms
  const authoredContacts = finish ? contacts(input, authoredArms) : released
  const targets = planted.map((p, i) => {
    const end = released[i]
    const y = mix(p.y, end.y, release)
    const x = surface(y) + mix(p.x - surface(p.y), end.x - surface(end.y), release)
    return { x: input.knobX + mix(x, authoredContacts[i].x, finish), y: KNOB_Y + mix(y, authoredContacts[i].y, finish) }
  })
  const arms = initialArms.map((a, i) => ({ ...a,
    upperLength: mix(a.upperLength, strongArms[i].upperLength, grow),
    foreLength: mix(a.foreLength, strongArms[i].foreLength, grow),
  }))
  // Signed flexion crosses neutral continuously in the recoil; solving the
  // shoulder from its reach avoids an IK branch switch or wrist jump.
  let bend = mix(initialArms[0].fore, -6, smooth(time, 0, 0.45))
  bend = mix(bend, 10, smooth(time, 1.55, 2.25))
  bend = mix(bend, authoredArms[0].fore, finish)
  const near = arms[0]
  const reach = Math.sqrt(near.upperLength ** 2 + near.foreLength ** 2
    + 2 * near.upperLength * near.foreLength * Math.cos(bend * rad))
  const brace = smooth(time, 0.45, 0.95) * (1 - smooth(time, 1.55, 2.25))
  const chest = mix(input.chest, 8 + 0.2 * (input.chest + 3), brace)
  const localShoulder = shoulderLocal(chest)
  const hx = targets[0].x - input.hipX - input.drive
  const hy = targets[0].y - input.hipY
  const p = -hx * localShoulder.x + hy * localShoulder.y
  const q = hx * localShoulder.y + hy * localShoulder.x
  const cosine = (hx * hx + hy * hy + localShoulder.x ** 2 + localShoulder.y ** 2 - reach ** 2) / (2 * Math.hypot(p, q))
  const torso = (Math.atan2(q, p) + Math.acos(Math.min(1, Math.max(-1, cosine)))) / rad
  const rig = { ...input, torso, chest }
  const shoulder = shoulderAt(rig)
  arms.forEach((a, i) => {
    const target = targets[i]
    const local = rotate(-(target.x - shoulder.x), target.y - shoulder.y, -(rig.torso + rig.chest))
    const d = Math.hypot(local.x, local.y)
    const sign = i === 0 ? Math.sign(bend) : 1
    const root = Math.acos(Math.min(1, Math.max(-1, (a.upperLength ** 2 + d * d - a.foreLength ** 2) / (2 * a.upperLength * d))))
    a.upper = (Math.atan2(-local.x, local.y) - sign * root) / rad
    a.fore = i === 0 ? bend : Math.acos(Math.min(1, Math.max(-1, (d * d - a.upperLength ** 2 - a.foreLength ** 2) / (2 * a.upperLength * a.foreLength)))) / rad
  })
  // A smooth head retraction clears the planted forearms without reacting
  // abruptly to the clearance threshold when the fast recoil begins.
  const firstTilt = (36 * smooth(time, 0.3, 0.95) + 5 * smooth(time, 0.15, 0.4))
    * (1 - smooth(time, 1.55, 2.25))
  const regroupTilt = 36 * smooth(time, 2.4, 2.65) * (1 - smooth(time, 3.12, 3.2))
  rig.head = input.head + firstTilt + regroupTilt
  return { rig, arms }
}

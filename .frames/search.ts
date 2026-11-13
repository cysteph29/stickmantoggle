import * as L from '../src/toggle/layout.ts'
import { INITIAL_RIG as R, rigToPose, type PushRig } from '../src/toggle/pushRig.ts'

export function metrics(input: PushRig) {
  const rig = { ...input, hipX: input.hipX + (input.drive ?? 0), drive: 0 }
  const p = rigToPose(rig)
  const P = (q: { x: number; y: number }) => ({ x: rig.hipX - q.x, y: rig.hipY + q.y })
  const shL = L.shoulderLocal(rig.chest), shR = L.rotate(shL.x, shL.y, rig.torso)
  const hand = (u: number, fo: number) => {
    const e = L.limbEnd(L.UPPER_ARM_LENGTH, u), w = L.limbEnd(L.FOREARM_LENGTH, u + fo)
    const r = L.rotate(e.x + w.x, e.y + w.y, rig.torso + rig.chest)
    return P({ x: shR.x + r.x, y: shR.y + r.y })
  }
  const nh = hand(p.upperArmLeft, p.forearmLeft), fh = hand(p.upperArmRight, p.forearmRight)
  const heel = { x: rig.backFootX, y: rig.backFootY }
  const g = { x: (nh.x + fh.x) / 2, y: (nh.y + fh.y) / 2 }
  const dx = g.x - heel.x, dy = g.y - heel.y, len = Math.hypot(dx, dy)
  const off = (q: { x: number; y: number }) => ((q.x - heel.x) * dy - (q.y - heel.y) * dx) / -len
  const fk = P(L.limbEnd(L.THIGH_LENGTH, p.thighLeft))
  return {
    elbN: Math.abs(p.forearmLeft), elbF: Math.abs(p.forearmRight),
    kneeB: Math.abs(p.shinRight), kneeF: Math.abs(p.shinLeft),
    backDeg: Math.atan2(heel.y - rig.hipY, rig.hipX - heel.x) / (Math.PI / 180),
    hipOff: off({ x: rig.hipX, y: rig.hipY }), shOff: off(P(shR)),
    kneeAhead: fk.x - rig.frontFootX,
  }
}

if (process.argv[1]?.endsWith('search.ts')) {
  let best: { s: number; v: Record<string, number>; m: ReturnType<typeof metrics> } | null = null
  const [t0, t1] = [Number(process.argv[2] ?? -49), Number(process.argv[3] ?? -45)]
  for (let hx = -30; hx <= 30; hx += 2)
    for (let hy = -6; hy <= 30; hy += 2)
      for (let torso = t0; torso <= t1; torso += 2)
        for (const gd of [-10, -6, -3, 0, 3])
          for (const spread of [0, 0.3, 0.6])
          for (const step of [-20, -30, -40, -50, -60]) {
            const rig = { ...R, hipX: R.hipX + hx, hipY: R.hipY + hy, torso, chest: -6, gripDrop: gd, gripSpread: spread, backFootX: R.backFootX + step, backFootY: R.backFootY - 3 }
            const m = metrics(rig)
            const pen = (v: number, lo: number, hi: number) => v < lo ? lo - v : v > hi ? v - hi : 0
            const s = Math.abs(m.hipOff) * 2 + Math.abs(m.shOff) + pen(m.kneeB, 8, 15) * 3 + pen(m.backDeg, 45, 55) * 2
              + pen(m.elbN, 15, 25) * 2 + pen(m.elbF, 15, 25) * 2 + pen(m.kneeAhead, 0, 10) * 2 + Math.abs(gd) * 0.2
            if (!best || s < best.s) best = { s, v: { hx, hy, torso, gd, spread, step }, m }
          }
  console.log(best)
}

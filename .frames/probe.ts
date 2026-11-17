import { createPushTimeline } from '../src/toggle/pushTimeline.ts'
import * as L from '../src/toggle/layout.ts'

const attrs: Record<string, Record<string, string>> = {}
const svg = {
  getElementById(id: string) {
    return { setAttribute(k: string, v: string) { (attrs[id] ??= {})[k] = v } }
  },
} as unknown as SVGSVGElement
const tl = createPushTimeline(svg, () => {})
tl.pause()
const rot = (id: string) => Number(/rotate\(([-\d.e]+)\)/.exec(attrs[id]?.transform ?? 'rotate(0)')![1])
const [t0, t1, n] = process.argv.slice(2).map(Number)
console.log('total', tl.duration())
for (let i = 0; i < n; i++) {
  const time = t0 + ((t1 - t0) * i) / (n - 1)
  tl.seek(time, false)
  const [hx, hy] = /translate\(([-\d.e]+) ([-\d.e]+)\)/.exec(attrs['character-root'].transform)!.slice(1).map(Number)
  const P = (p: { x: number; y: number }) => ({ x: hx - p.x, y: hy + p.y })
  const t = rot('torso-pivot'), c = rot('chest-pivot'), h = rot('head-pivot')
  const cross = (a: any, b: any, p: any) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)
  const knee = (s: string) => {
    const th = rot(`thigh-${s}-pivot`), sh = rot(`shin-${s}-pivot`)
    const k = L.limbEnd(L.THIGH_LENGTH, th), a = L.limbEnd(L.SHIN_LENGTH, th + sh)
    const K = P(k), A = P({ x: k.x + a.x, y: k.y + a.y }), H = P({ x: 0, y: 0 })
    // knee toward +x of the hip-ankle line
    const side = K.x - (H.x + (A.x - H.x) * (K.y - H.y) / (A.y - H.y))
    return `${Math.abs(sh).toFixed(0)}°${side > 0 ? '+x' : '-X!'}`
  }
  const shL = L.shoulderLocal(c), sh = L.rotate(shL.x, shL.y, t)
  const neckL = L.rotate(0, -L.TORSO_LENGTH - L.CHEST_Y, c)
  const headBaseL = L.rotate(0, -L.NECK_LENGTH, c)
  const hb = L.rotate(neckL.x + headBaseL.x, L.CHEST_Y + neckL.y + headBaseL.y, t)
  const hc0 = L.rotate(0, -L.HEAD_RADIUS, t + c + h)
  const head = P({ x: hb.x + hc0.x, y: hb.y + hc0.y })
  const arm = (s: string) => {
    const u = rot(`upper-arm-${s}-pivot`), f = rot(`forearm-${s}-pivot`)
    const e = L.rotate(...Object.values(L.limbEnd(L.UPPER_ARM_LENGTH, u)) as [number, number], t + c)
    const w0 = L.rotate(...Object.values(L.limbEnd(L.FOREARM_LENGTH, u + f)) as [number, number], t + c)
    return { f, wrist: P({ x: sh.x + e.x + w0.x, y: sh.y + e.y + w0.y }) }
  }
  const S = P(sh), a = arm('left'), b = arm('right')
  // signed distance of head center below the shoulder-wrist line (+ = below)
  const len = Math.hypot(a.wrist.x - S.x, a.wrist.y - S.y)
  const below = cross(S, a.wrist, head) / len
  const backFoot = rot('thigh-right-pivot')
  console.log(
    time.toFixed(2), `torso ${t.toFixed(1)} head ${h.toFixed(0)}`,
    `knees ${knee('left')} ${knee('right')}`,
    `elbows ${Math.abs(a.f).toFixed(0)} ${Math.abs(b.f).toFixed(0)}`,
    `handY-shY ${(a.wrist.y - S.y).toFixed(0)}`,
    `headBelowArm ${(below - L.HEAD_RADIUS).toFixed(1)}`, `hipX ${hx.toFixed(0)}`, backFoot ? '' : '',
  )
}

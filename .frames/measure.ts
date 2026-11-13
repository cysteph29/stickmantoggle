import { createPushTimeline } from '../src/toggle/pushTimeline.ts'
import * as L from '../src/toggle/layout.ts'

const attrs: Record<string, Record<string, string>> = {}
const svg = {
  getElementById(id: string) {
    return { setAttribute(k: string, v: string) { (attrs[id] ??= {})[k] = v } }
  },
} as unknown as SVGSVGElement
const tl = createPushTimeline(svg, () => {}, 'four')
tl.pause()
const rot = (id: string) => Number(/rotate\(([-\d.e]+)\)/.exec(attrs[id]?.transform ?? 'rotate(0)')![1])
const f = (n: number) => n.toFixed(1).padStart(6)

console.log('    t   elbN  elbF  kneeF kneeB backDeg hipOff shOff  torso chest  head  hipDx  fy   by')
for (const t of process.argv.slice(2).map(Number)) {
  tl.seek(t, false)
  const [hx, hy] = /translate\(([-\d.e]+) ([-\d.e]+)\)/.exec(attrs['character-root'].transform)!.slice(1).map(Number)
  const P = (p: { x: number; y: number }) => ({ x: hx - p.x, y: hy + p.y })
  const tor = rot('torso-pivot'), ch = rot('chest-pivot')
  const leg = (s: string) => {
    const th = rot(`thigh-${s}-pivot`), sh = rot(`shin-${s}-pivot`)
    const k = L.limbEnd(L.THIGH_LENGTH, th), a = L.limbEnd(L.SHIN_LENGTH, th + sh)
    return { sh, ankle: P({ x: k.x + a.x, y: k.y + a.y }) }
  }
  const shL = L.shoulderLocal(ch), shR = L.rotate(shL.x, shL.y, tor)
  const shoulder = P(shR)
  const hand = (s: string) => {
    const u = rot(`upper-arm-${s}-pivot`), fo = rot(`forearm-${s}-pivot`)
    const e = L.limbEnd(L.UPPER_ARM_LENGTH, u), w = L.limbEnd(L.FOREARM_LENGTH, u + fo)
    const r = L.rotate(e.x + w.x, e.y + w.y, tor + ch)
    return { fo, p: P({ x: shR.x + r.x, y: shR.y + r.y }) }
  }
  const nl = leg('left'), fl = leg('right'), nh = hand('left'), fh = hand('right')
  const heel = fl.ankle
  const hands = { x: (nh.p.x + fh.p.x) / 2, y: (nh.p.y + fh.p.y) / 2 }
  const dx = hands.x - heel.x, dy = hands.y - heel.y, len = Math.hypot(dx, dy)
  // Signed distance from the heel-to-hands line; positive is below the line.
  const off = (p: { x: number; y: number }) => ((p.x - heel.x) * dy - (p.y - heel.y) * dx) / -len
  const backDeg = Math.atan2(heel.y - hy, hx - heel.x) / (Math.PI / 180)
  console.log(
    f(t), f(Math.abs(nh.fo)), f(Math.abs(fh.fo)), f(Math.abs(nl.sh)), f(Math.abs(fl.sh)), f(backDeg),
    f(off({ x: hx, y: hy })), f(off(shoulder)), f(tor), f(ch), f(rot('head-pivot')),
    f(hx - L.CHARACTER_HIP_X), f(nl.ankle.y - L.GROUND_Y), f(fl.ankle.y - L.GROUND_Y),
  )
}

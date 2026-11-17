import { createPushTimeline } from '../src/toggle/pushTimeline.ts'
import * as L from '../src/toggle/layout.ts'
import { writeFileSync } from 'node:fs'

const attrs: Record<string, Record<string, string>> = {}
const svg = {
  getElementById(id: string) {
    return { setAttribute(k: string, v: string) { (attrs[id] ??= {})[k] = v } }
  },
} as unknown as SVGSVGElement

const tl = createPushTimeline(svg, () => {})
tl.pause()
const total = tl.duration()
const rot = (id: string) => Number(/rotate\(([-\d.e]+)\)/.exec(attrs[id]?.transform ?? 'rotate(0)')![1])

function frame() {
  const [hx, hy] = /translate\(([-\d.e]+) ([-\d.e]+)\)/.exec(attrs['character-root'].transform)!.slice(1).map(Number)
  // local space faces -x, then mirrored
  const P = (p: { x: number; y: number }) => ({ x: hx - p.x, y: hy + p.y })
  const t = rot('torso-pivot'), c = rot('chest-pivot'), h = rot('head-pivot')
  const lines: [any, any][] = []
  const leg = (s: string) => {
    const th = rot(`thigh-${s}-pivot`), sh = rot(`shin-${s}-pivot`)
    const k = L.limbEnd(L.THIGH_LENGTH, th), a = L.limbEnd(L.SHIN_LENGTH, th + sh)
    const knee = k, ankle = { x: k.x + a.x, y: k.y + a.y }
    lines.push([P({ x: 0, y: 0 }), P(knee)], [P(knee), P(ankle)])
  }
  leg('right'); leg('left')
  const chestP = L.rotate(0, L.CHEST_Y, t)
  const shL = L.shoulderLocal(c), sh = L.rotate(shL.x, shL.y, t)
  const neckL = L.rotate(0, -L.TORSO_LENGTH - L.CHEST_Y, c)
  const neck = L.rotate(neckL.x, L.CHEST_Y + neckL.y, t)
  const headBaseL = L.rotate(0, -L.NECK_LENGTH, c)
  const hb = L.rotate(neckL.x + headBaseL.x, L.CHEST_Y + neckL.y + headBaseL.y, t)
  const hc0 = L.rotate(0, -L.HEAD_RADIUS, t + c + h)
  const head = { x: hb.x + hc0.x, y: hb.y + hc0.y }
  lines.push([P({ x: 0, y: 0 }), P(chestP)], [P(chestP), P(neck)], [P(neck), P(hb)])
  const arm = (s: string) => {
    const u = rot(`upper-arm-${s}-pivot`), f = rot(`forearm-${s}-pivot`)
    const e = L.rotate(...Object.values(L.limbEnd(L.UPPER_ARM_LENGTH, u)) as [number, number], t + c)
    const w0 = L.limbEnd(L.FOREARM_LENGTH, u + f)
    const w = L.rotate(w0.x, w0.y, t + c)
    const elbow = { x: sh.x + e.x, y: sh.y + e.y }
    lines.push([P(sh), P(elbow)], [P(elbow), P({ x: elbow.x + w.x, y: elbow.y + w.y })])
  }
  arm('right'); arm('left')
  const knobX = Number(attrs['knob'].cx)
  return { lines, head: P(head), knobX }
}


const frames = []
let minGap = Infinity
for (let i = 0; i <= 1350; i++) {
  tl.seek(8.65 + i / 1000, false)
  const f = frame()
  const gap = Math.hypot(f.head.x - f.knobX, f.head.y - L.KNOB_Y) - L.HEAD_RADIUS - L.KNOB_RADIUS - 3.5
  minGap = Math.min(minGap, gap)
  if (rot('shin-left-pivot') >= 0 || rot('shin-right-pivot') >= 0) throw Error('Knee flip')
}
for (const t of [6.5, 6.75, 7.15, 7.75, 8.3, 8.65, 8.9, 9.15, 9.4, 9.65, 9.85, 10]) {
 tl.seek(t, false); frames.push({t, ...frame()})
}
writeFileSync('/tmp/stand-frames.json', JSON.stringify(frames))
console.log(JSON.stringify({duration: total, labels: tl.labels, minOutlineGap: minGap, kneeBend: [rot('shin-left-pivot'), rot('shin-right-pivot')]}))
tl.kill()

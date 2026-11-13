import { createPushTimeline } from '../src/toggle/pushTimeline.ts'
import * as L from '../src/toggle/layout.ts'
import { writeFileSync } from 'node:fs'

const variant = (process.argv[2] ?? 'six') as 'six' | 'four'
const attrs: Record<string, Record<string, string>> = {}
const svg = {
  getElementById(id: string) {
    return { setAttribute(k: string, v: string) { (attrs[id] ??= {})[k] = v } }
  },
} as unknown as SVGSVGElement

const tl = createPushTimeline(svg, () => {}, variant)
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

const N = Number(process.argv[3] ?? 24)
const t0 = Number(process.argv[4] ?? 0), t1 = Number(process.argv[5] ?? total)
const cols = 2, cw = 700, ch = 330
const rows = Math.ceil(N / cols)
let out = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cw}" height="${rows * ch}" style="background:#fff"><rect width="100%" height="100%" fill="#fff"/>`
for (let i = 0; i < N; i++) {
  const time = Math.max(0.001, t0 + ((t1 - t0) * i) / (N - 1) - 0.001)
  tl.seek(time, false)
  const f = frame()
  const ox = (i % cols) * cw, oy = Math.floor(i / cols) * ch
  const minX = Math.max(230, f.head.x - 350), minY = L.GROUND_Y - 280
  out += `<g transform="translate(${ox} ${oy}) scale(1) translate(${-minX} ${-minY})">`
  out += `<line x1="${minX}" x2="${minX + 1000}" y1="${L.GROUND_Y}" y2="${L.GROUND_Y}" stroke="#aaa"/>`
  out += `<circle cx="${f.knobX}" cy="${L.KNOB_Y}" r="${L.KNOB_RADIUS}" fill="none" stroke="#ccc" stroke-width="3"/>`
  for (const [a, b] of f.lines) out += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#000" stroke-width="4" stroke-linecap="round"/>`
  out += `<circle cx="${f.head.x}" cy="${f.head.y}" r="20" fill="none" stroke="#000" stroke-width="4"/>`
  out += `<text x="${minX + 10}" y="${minY + 30}" font-size="26" font-family="Helvetica">${time.toFixed(2)}s</text></g>`
}
out += '</svg>'
writeFileSync(`.frames/${variant}-${t0}.svg`, out)
console.log('total', total)

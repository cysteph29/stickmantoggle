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
const b = tl.labels.break
const rot = (id: string) => Number(/rotate\(([-\d.e]+)\)/.exec(attrs[id].transform)![1])
console.log('break at', b)
for (let t = b - 0.03; t <= b + 0.3; t += 0.01) {
  tl.seek(t, false)
  const tor = rot('torso-pivot'), c = rot('chest-pivot')
  const row = [`${(t - b).toFixed(2)}`, `torso ${tor.toFixed(0)}`]
  for (const s of ['left', 'right']) {
    const u = rot(`upper-arm-${s}-pivot`), f = rot(`forearm-${s}-pivot`)
    const e = L.limbEnd(L.UPPER_ARM_LENGTH, u), w = L.limbEnd(L.FOREARM_LENGTH, u + f)
    const hand = L.rotate(e.x + w.x, e.y + w.y, tor + c)
    // mirrored: stage dx = -local x
    row.push(`${s} up ${u.toFixed(0)} fore ${f.toFixed(0)} hand dx ${(-hand.x).toFixed(0)} dy ${hand.y.toFixed(0)}`)
  }
  console.log(row.join(' | '))
}

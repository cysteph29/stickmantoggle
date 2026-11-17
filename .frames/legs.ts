// Leg probe for the four-step stumble. Every 20ms prints each foot's height
// above its floor, each knee's x, and each knee's bend side (+ means the knee
// sits on the +x side of the hip-ankle line). Then checks per step:
// swing height, swing knee ahead from passing to contact, foot ahead of hip.
// Also prints hip forward speed from break through 7.0s with contact marks.
import { createPushTimeline } from '../src/toggle/pushTimeline.ts'
import { INITIAL_RIG as R } from '../src/toggle/pushRig.ts'
import * as L from '../src/toggle/layout.ts'

const attrs: Record<string, Record<string, string>> = {}
const svg = {
  getElementById(id: string) {
    return { setAttribute(k: string, v: string) { (attrs[id] ??= {})[k] = v } }
  },
} as unknown as SVGSVGElement
const tl = createPushTimeline(svg, () => {})
tl.pause()
const rot = (id: string) => Number(/rotate\(([-\d.e]+)\)/.exec(attrs[id].transform)![1])
const t0 = tl.labels.break, t1 = tl.labels.catch + 0.1
const stumble = tl.labels.stumble
// Four-step contacts, absolute time (stumble + step.contact).
const CONTACTS = [0.3, 0.82, 1.28, 2.1].map((c) => +(stumble + c).toFixed(2))
console.log(`total ${tl.duration().toFixed(2)}  break ${t0.toFixed(2)}  stumble ${stumble.toFixed(2)}  catch ${tl.labels.catch.toFixed(2)}`)
console.log(`contacts ${CONTACTS.join('  ')}`)

type Leg = { kx: number; ax: number; h: number; bend: number }
function sample(t: number) {
  tl.seek(t, false)
  const [hx, hy] = /translate\(([-\d.e]+) ([-\d.e]+)\)/.exec(attrs['character-root'].transform)!.slice(1).map(Number)
  const leg = (s: 'left' | 'right', floor: number): Leg => {
    const th = rot(`thigh-${s}-pivot`), sh = rot(`shin-${s}-pivot`)
    const k = L.limbEnd(L.THIGH_LENGTH, th), a = L.limbEnd(L.SHIN_LENGTH, th + sh)
    const knee = { x: hx - k.x, y: hy + k.y }, ankle = { x: hx - k.x - a.x, y: hy + k.y + a.y }
    // Signed side of the knee relative to hip->ankle, positive toward +x.
    const dx = ankle.x - hx, dy = ankle.y - hy
    const bend = (dy * (knee.x - hx) - dx * (knee.y - hy)) / Math.hypot(dx, dy)
    return { kx: knee.x, ax: ankle.x, h: floor - ankle.y, bend }
  }
  // left = near leg = front foot, right = far leg = back foot
  return { t, hx, front: leg('left', R.frontFootY), back: leg('right', R.backFootY) }
}

const rows = [] as ReturnType<typeof sample>[]
for (let t = t0; t <= t1 + 1e-9; t += 0.02) rows.push(sample(t))

const f = (n: number, w = 6) => n.toFixed(1).padStart(w)
console.log('   t   hipX  hipV | frontH frontKx bendF | backH  backKx  bendB')
for (let i = 0; i < rows.length; i++) {
  const r = rows[i]
  const v = i ? (r.hx - rows[i - 1].hx) / (r.t - rows[i - 1].t) : 0
  const mark = CONTACTS.some((c) => Math.abs(c - r.t) < 1e-9) ? ' *contact*' : ''
  console.log(
    `${r.t.toFixed(2)} ${f(r.hx)} ${f(v, 7)} | ${f(r.front.h)} ${f(r.front.kx, 7)} ${f(r.front.bend)} | ${f(r.back.h)} ${f(r.back.kx, 7)} ${f(r.back.bend)}${mark}`,
  )
}

// Hip speed summary: rise through each swing, drop after each contact, no
// reverse before the hold, and decaying pulse size.
const holdT = stumble + 1.9
const hipRows = rows.filter((r) => r.t >= t0 - 1e-9 && r.t <= 7.0 + 1e-9)
const hipV = hipRows.map((r, i) =>
  i ? (r.hx - hipRows[i - 1].hx) / (r.t - hipRows[i - 1].t) : 0,
)
console.log('\n--- hip forward speed ---')
const swings = [
  [stumble, CONTACTS[0]],
  [CONTACTS[0] + 0.08, CONTACTS[1]],
  [CONTACTS[1] + 0.08, CONTACTS[2]],
  [stumble + 1.46, holdT],
]
const brakes = [
  [CONTACTS[0], CONTACTS[0] + 0.08],
  [CONTACTS[1], CONTACTS[1] + 0.08],
  [CONTACTS[2], CONTACTS[2] + 0.08],
  [stumble + 1.78, holdT],
]
let hipOk = true
const drops: number[] = []
for (let i = 0; i < 4; i++) {
  const sw = hipRows
    .map((r, j) => ({ r, v: hipV[j] }))
    .filter(({ r }) => r.t >= swings[i][0] - 1e-9 && r.t <= swings[i][1] + 1e-9)
  const br = hipRows
    .map((r, j) => ({ r, v: hipV[j] }))
    .filter(({ r }) => r.t >= brakes[i][0] - 1e-9 && r.t <= brakes[i][1] + 1e-9)
  const v0 = sw[0]?.v ?? 0
  const maxV = Math.max(...sw.map((s) => s.v))
  const minV = Math.min(...br.map((s) => s.v))
  const riseOk = maxV > v0 + 1
  const drop = maxV - minV
  drops.push(drop)
  hipOk &&= riseOk
  console.log(
    `pulse ${i + 1}  swing ${swings[i][0].toFixed(2)}-${swings[i][1].toFixed(2)}  ` +
    `v ${v0.toFixed(0)}→peak ${maxV.toFixed(0)} ${riseOk ? 'rise OK' : 'rise FAIL'}  ` +
    `brake min ${minV.toFixed(0)}  drop ${drop.toFixed(0)}`,
  )
}
for (let i = 1; i < drops.length; i++) {
  const ok = drops[i] < drops[i - 1]
  hipOk &&= ok
  console.log(`pulse ${i + 1} < pulse ${i}: ${drops[i].toFixed(0)} < ${drops[i - 1].toFixed(0)} ${ok ? 'OK' : 'FAIL'}`)
}
// Skip the first sample (no prior frame) and stop before the hold.
const beforeHold = hipRows
  .map((r, j) => ({ r, v: hipV[j] }))
  .filter(({ r }, j) => j > 0 && r.t < holdT - 1e-9)
const minBefore = Math.min(...beforeHold.map((s) => s.v))
const posOk = minBefore > 0
hipOk &&= posOk
console.log(`min hipV before hold (${holdT.toFixed(2)}s): ${minBefore.toFixed(1)} ${posOk ? 'OK' : 'FAIL'}`)
console.log(hipOk ? 'HIP SPEED CHECKS PASS' : 'HIP SPEED CHECKS FAIL')


// Steps: a foot that leaves the floor (h > 0.5) and comes back (h <= 0.5).
const LIMIT = 38
let ok = true
let step = 0
const minBend = Math.min(...rows.flatMap((r) => [r.front.bend, r.back.bend]))
console.log(`\nmin knee bend toward +x across stumble: ${minBend.toFixed(2)}px ${minBend > 0 ? 'OK' : 'FAIL'}`)
if (minBend <= 0) ok = false
let cursor = rows.findIndex((r) => r.t >= tl.labels.stumble - 1e-9)
for (const side of ['back', 'front', 'back', 'front'] as const) {
  step++
  const other = side === 'back' ? 'front' : 'back'
  let s = cursor
  while (s < rows.length && rows[s][side].h <= 0.5) s++
  let c = s
  while (c < rows.length - 1 && rows[c][side].h > 0.5) c++
  cursor = c + 1
  const swing = rows.slice(s, c + 1)
  const peak = Math.max(...swing.map((r) => r[side].h))
  const pass = swing.findIndex((r) => r[side].ax >= r[other].ax)
  const passRow = swing[pass]
  const leadMin = Math.min(...swing.slice(pass).map((r) => r[side].kx - r[other].kx))
  const contact = rows[Math.min(c, rows.length - 1)]
  const ahead = contact[side].ax - contact.hx
  const hOK = step === 1 || peak < LIMIT, kOK = leadMin > 0, aOK = ahead > 0
  ok &&= hOK && kOK && aOK
  console.log(
    `step ${step} (${side}) swing ${swing[0].t.toFixed(2)}-${contact.t.toFixed(2)}s  ` +
    `peak ${peak.toFixed(1)}px ${step === 1 ? '(exempt)' : hOK ? 'OK' : 'FAIL'}  ` +
    `pass @${passRow.t.toFixed(2)}s h=${passRow[side].h.toFixed(1)}  ` +
    `min knee lead ${leadMin.toFixed(1)} ${kOK ? 'OK' : 'FAIL'}  ` +
    `foot-hip at contact ${ahead.toFixed(1)} ${aOK ? 'OK' : 'FAIL'}`,
  )
}
console.log(ok ? 'ALL CHECKS PASS' : 'SOME CHECKS FAIL')

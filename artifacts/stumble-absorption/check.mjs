import assert from 'node:assert/strict'
import fs from 'node:fs'
globalThis.window = { matchMedia: () => ({ matches: false }) }
globalThis.document = { documentElement: { style: { setProperty() {} } } }
const { createPushTimeline } = await import('../../src/toggle/pushTimeline.ts')
const { alternatePushRig } = await import('../../src/toggle/walkPush.ts')
const { rigToPose } = await import('../../src/toggle/pushRig.ts')
const { footLocal } = await import('../../src/toggle/layout.ts')
let state
const tl = createPushTimeline({}, () => {}, (_, rig, time) => {
  state = { base: { ...rig }, rig: alternatePushRig(rig, time) }
}).pause()
let maxReach = 0, maxFootError = 0, minBend = Infinity, maxAngleDelta = 0, previous
const rows = []
for (let i = 1; i <= Math.ceil(tl.duration() * 1000); i++) {
  const t = Math.min(i / 1000, tl.duration())
  tl.time(t, false)
  const { base, rig } = state
  for (const key of Object.keys(base)) {
    if (['hipX', 'hipY', 'frontFootX', 'backFootX', 'knobX', '_gsap'].includes(key)) continue
    assert.equal(rig[key], base[key], `${key} changed at ${t}`)
  }
  assert(Math.abs((rig.frontFootX - base.frontFootX) - (rig.hipX - base.hipX)) < 1e-9)
  assert(Math.abs((rig.backFootX - base.backFootX) - (rig.hipX - base.hipX)) < 1e-9)
  const s = t - tl.labels.stumble
  if (s <= .62 || s >= 1.48) assert.equal(rig.hipY, base.hipY)
  if (s >= .62 && s <= 1.48) {
    const pose = rigToPose(rig)
    for (const [side, foot] of [['Left', 'front'], ['Right', 'back']]) {
      const thigh = pose[`thigh${side}`], shin = pose[`shin${side}`]
      assert(shin < 0, 'Knee bend flipped')
      minBend = Math.min(minBend, -shin)
      const end = footLocal(thigh, shin)
      maxFootError = Math.max(maxFootError, Math.hypot(rig.hipX + rig.drive - end.x - rig[`${foot}FootX`], rig.hipY + end.y - rig[`${foot}FootY`]))
      maxReach = Math.max(maxReach, Math.hypot(rig[`${foot}FootX`] - rig.hipX - rig.drive, rig[`${foot}FootY`] - rig.hipY))
      if (previous) for (const key of [`thigh${side}`, `shin${side}`]) maxAngleDelta = Math.max(maxAngleDelta, Math.abs(pose[key] - previous[key]))
    }
    previous = pose
  }
}
for (const contact of [.82, 1.28]) for (const dt of [-.04, 0, .04, .08, .12, .16]) {
 tl.time(tl.labels.stumble + contact + dt, false)
 rows.push({contact, millisecondsAfterContact:Math.round(dt*1000), beforeHipY:state.base.hipY, afterHipY:state.rig.hipY})
}
const report={sampleRate:1000,labels:tl.labels,maxReach,legLength:94,minKneeBendDegrees:minBend,maxJointChangePerMillisecond:maxAngleDelta,maxFootError,rows,visualReview:'Pending: browser capture execution was rejected.'}
fs.writeFileSync('artifacts/stumble-absorption/check-report.json', JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
assert(maxReach < 94)
assert(maxFootError < 1e-8)
process.exit(0)

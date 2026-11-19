import { isUniform, uniformRig } from './uniformRig.ts'
/** Walk-only contact articulation; wrists and all body channels stay authored. */
import { FOREARM_LENGTH, UPPER_ARM_LENGTH, limbEnd, rotate, solveTwoBone, shoulderLocal } from './layout.ts'
import { rigToPose, type PushRig } from './pushRig.ts'

export function walkContactArms(rig: PushRig, weight: number) {
  const pose = rigToPose(rig)
  return (['Left', 'Right'] as const).map((side) => {
    const upper = pose[`upperArm${side}`]
    const fore = pose[`forearm${side}`]
    const angle = rig.torso + rig.chest
    const elbow = limbEnd(UPPER_ARM_LENGTH, upper)
    const end = limbEnd(FOREARM_LENGTH, upper + fore)
    // In the mirrored stage, +x moves the elbow back from the fixed wrist.
    const offset = rotate(side === 'Left' ? 8 : 4, side === 'Left' ? -18 : -14, -angle)
    const x = elbow.x + offset.x * weight
    const y = elbow.y + offset.y * weight
    const dx = elbow.x + end.x - x
    const dy = elbow.y + end.y - y
    const a = Math.atan2(-x, y) * 180 / Math.PI
    const upperLength = weight ? Math.hypot(x, y) : UPPER_ARM_LENGTH
    const foreLength = weight ? Math.hypot(dx, dy) : FOREARM_LENGTH
    return {
      side: side.toLowerCase(),
      upper: weight ? a : upper,
      fore: weight ? Math.atan2(-dx, dy) * 180 / Math.PI - a : fore,
      upperLength,
      foreLength,
    }
  })
}

export function applyWalkContactArms(svg: SVGSVGElement, rig: PushRig, weight: number, arms = walkContactArms(rig, weight)) {
  const drop = isUniform(svg) ? uniformRig(rig).hipY - rig.hipY : 0
  const contact = Math.max(rig.grip, weight)
  let adjusted = arms
  if (drop && contact) {
    const shoulder = shoulderLocal(rig.chest)
    const original = rotate(shoulder.x, shoulder.y, rig.torso)
    const targets = arms.map(arm => {
      const elbow = limbEnd(arm.upperLength, arm.upper + rig.torso + rig.chest)
      const fore = limbEnd(arm.foreLength, arm.upper + arm.fore + rig.torso + rig.chest)
      return { x: original.x + elbow.x + fore.x,
        y: original.y + elbow.y + fore.y - drop * contact }
    })
    // A slight torso lean supplies reach when lowering the hip would otherwise
    // pull an extended arm off the knob. Keep authored link lengths and wrists.
    const error = (angle: number) => {
      const at = rotate(shoulder.x, shoulder.y, angle)
      return Math.max(...arms.map((arm, i) => {
        const d = Math.hypot(targets[i].x - at.x, targets[i].y - at.y)
        return Math.max(0, d - arm.upperLength - arm.foreLength + 0.01,
          Math.abs(arm.upperLength - arm.foreLength) + 0.01 - d)
      }))
    }
    let angle = rig.torso
    if (error(angle) > 0) {
      let best = Infinity
      for (let delta = -60; delta <= 60; delta += 0.1) {
        const score = error(rig.torso + delta) * 10000 + Math.abs(delta)
        if (score < best) { best = score; angle = rig.torso + delta }
      }
    }
    svg.getElementById('torso-pivot')?.setAttribute('transform', `rotate(${angle})`)
    const at = rotate(shoulder.x, shoulder.y, angle)
    adjusted = arms.map((arm, i) => {
      const local = rotate(targets[i].x - at.x, targets[i].y - at.y, -(angle + rig.chest))
      const solved = solveTwoBone(arm.upperLength, arm.foreLength,
        local.x, local.y, Math.sign(arm.fore) || 1)
      return { ...arm, upper: solved.upper, fore: solved.lower }
    })
  }
  for (const arm of adjusted) {
    const set = (id: string, attr: string, value: string) => svg.getElementById(id)?.setAttribute(attr, value)
    set(`upper-arm-${arm.side}-pivot`, 'transform', `rotate(${arm.upper})`)
    set(`forearm-${arm.side}-pivot`, 'transform', `rotate(${arm.fore})`)
    set(`upper-arm-${arm.side}`, 'y2', String(arm.upperLength))
    set(`elbow-${arm.side}`, 'transform', `translate(0 ${arm.upperLength})`)
    set(`forearm-${arm.side}`, 'y2', String(arm.foreLength))
    set(`wrist-${arm.side}`, 'transform', `translate(0 ${arm.foreLength})`)
  }
}

/** Walk-only contact articulation; wrists and all body channels stay authored. */
import { FOREARM_LENGTH, UPPER_ARM_LENGTH, limbEnd, rotate } from './layout.ts'
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
  for (const arm of arms) {
    const set = (id: string, attr: string, value: string) => svg.getElementById(id)?.setAttribute(attr, value)
    set(`upper-arm-${arm.side}-pivot`, 'transform', `rotate(${arm.upper})`)
    set(`forearm-${arm.side}-pivot`, 'transform', `rotate(${arm.fore})`)
    set(`upper-arm-${arm.side}`, 'y2', String(arm.upperLength))
    set(`elbow-${arm.side}`, 'transform', `translate(0 ${arm.upperLength})`)
    set(`forearm-${arm.side}`, 'y2', String(arm.foreLength))
    set(`wrist-${arm.side}`, 'transform', `translate(0 ${arm.foreLength})`)
  }
}

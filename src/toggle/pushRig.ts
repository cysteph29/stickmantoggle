/**
 * Animation state for the push sequence and the code that drives the SVG.
 *
 * The timeline tweens a flat `PushRig` in stage space. Feet and hands are
 * contact targets; a closed-form two-bone solve turns them into the limb
 * angles of the existing rig, so planted feet stay planted and the hands
 * stay on the knob while `grip` is 1.
 */
import {
  CHARACTER_HIP_X,
  CHARACTER_HIP_Y,
  FOREARM_LENGTH,
  INITIAL_POSE,
  KNOB_LEFT_X,
  KNOB_RADIUS,
  KNOB_Y,
  SHIN_LENGTH,
  THIGH_LENGTH,
  UPPER_ARM_LENGTH,
  footLocal,
  handLocal,
  rotate,
  shoulderLocal,
  solveTwoBone,
  spinePath,
  type StickPose,
} from './layout.ts'

export type PushRig = {
  hipX: number
  hipY: number
  torso: number
  chest: number
  head: number
  knobX: number
  frontFootX: number
  frontFootY: number
  backFootX: number
  backFootY: number
  /** 1 keeps the hands on the knob; 0 uses the free arm angles below. */
  grip: number
  /** Slides both hands down the knob surface, in px, as the body lowers. */
  gripDrop: number
  /** Vertical gap between the hands: 1 is the rest grip, 0 puts them level. */
  gripSpread: number
  /**
   * Forward hip offset, in px, added on top of hipX. It lets the body follow
   * the knob while the tremble keys hipX relatively.
   */
  drive: number
  upperArmLeft: number
  forearmLeft: number
  upperArmRight: number
  forearmRight: number
}

/** Local (pre-mirror) offset to stage space. The figure faces +x on stage. */
function toStage(local: { x: number; y: number }, hipX: number, hipY: number) {
  return { x: hipX - local.x, y: hipY + local.y }
}

const frontFoot = toStage(
  footLocal(INITIAL_POSE.thighLeft, INITIAL_POSE.shinLeft),
  CHARACTER_HIP_X,
  CHARACTER_HIP_Y,
)
const backFoot = toStage(
  footLocal(INITIAL_POSE.thighRight, INITIAL_POSE.shinRight),
  CHARACTER_HIP_X,
  CHARACTER_HIP_Y,
)

function handGrip(upper: number, forearm: number) {
  const hand = toStage(
    handLocal(upper, forearm, INITIAL_POSE.torso),
    CHARACTER_HIP_X,
    CHARACTER_HIP_Y,
  )
  return { x: hand.x - KNOB_LEFT_X, y: hand.y - KNOB_Y }
}

/** Wrist positions relative to the knob center, taken from the rest pose. */
const NEAR_GRIP = handGrip(INITIAL_POSE.upperArmLeft, INITIAL_POSE.forearmLeft)
const FAR_GRIP = handGrip(INITIAL_POSE.upperArmRight, INITIAL_POSE.forearmRight)
const GRIP_MID_Y = (NEAR_GRIP.y + FAR_GRIP.y) / 2

export const INITIAL_RIG: PushRig = {
  hipX: CHARACTER_HIP_X,
  hipY: CHARACTER_HIP_Y,
  torso: INITIAL_POSE.torso,
  chest: INITIAL_POSE.chest,
  head: INITIAL_POSE.head,
  knobX: KNOB_LEFT_X,
  frontFootX: frontFoot.x,
  frontFootY: frontFoot.y,
  backFootX: backFoot.x,
  backFootY: backFoot.y,
  grip: 1,
  gripDrop: 0,
  gripSpread: 1,
  drive: 0,
  upperArmLeft: INITIAL_POSE.upperArmLeft,
  forearmLeft: INITIAL_POSE.forearmLeft,
  upperArmRight: INITIAL_POSE.upperArmRight,
  forearmRight: INITIAL_POSE.forearmRight,
}

const NEAR_LEG_BEND = Math.sign(INITIAL_POSE.shinLeft)
const FAR_LEG_BEND = Math.sign(INITIAL_POSE.shinRight)
const NEAR_ARM_BEND = Math.sign(INITIAL_POSE.forearmLeft)
const FAR_ARM_BEND = Math.sign(INITIAL_POSE.forearmRight)

function solveLeg(rig: PushRig, footX: number, footY: number, bend: number) {
  return solveTwoBone(
    THIGH_LENGTH,
    SHIN_LENGTH,
    -(footX - rig.hipX),
    footY - rig.hipY,
    bend,
  )
}

/** Left-surface x of the knob at a height relative to its center. */
function surfaceX(dy: number) {
  return -Math.sqrt(Math.max(KNOB_RADIUS ** 2 - dy * dy, 0))
}

/** Stage shoulder position. Arms hang in the frame of torso plus chest. */
function shoulderStage(rig: PushRig) {
  const local = shoulderLocal(rig.chest)
  return toStage(rotate(local.x, local.y, rig.torso), rig.hipX, rig.hipY)
}

function solveArm(rig: PushRig, grip: { x: number; y: number }, bend: number) {
  const shoulder = shoulderStage(rig)
  const gripY = GRIP_MID_Y + (grip.y - GRIP_MID_Y) * rig.gripSpread + rig.gripDrop
  const gripX = grip.x + surfaceX(gripY) - surfaceX(grip.y)
  const local = rotate(
    -(rig.knobX + gripX - shoulder.x),
    KNOB_Y + gripY - shoulder.y,
    -(rig.torso + rig.chest),
  )
  return solveTwoBone(UPPER_ARM_LENGTH, FOREARM_LENGTH, local.x, local.y, bend)
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t

/** Folds `drive` into the hip so the solvers see the final hip position. */
function driven(rig: PushRig): PushRig {
  return rig.drive ? { ...rig, hipX: rig.hipX + rig.drive, drive: 0 } : rig
}

export function rigToPose(input: PushRig): StickPose {
  const rig = driven(input)
  const nearLeg = solveLeg(rig, rig.frontFootX, rig.frontFootY, NEAR_LEG_BEND)
  const farLeg = solveLeg(rig, rig.backFootX, rig.backFootY, FAR_LEG_BEND)
  const nearArm = solveArm(rig, NEAR_GRIP, NEAR_ARM_BEND)
  const farArm = solveArm(rig, FAR_GRIP, FAR_ARM_BEND)
  return {
    torso: rig.torso,
    chest: rig.chest,
    head: rig.head,
    upperArmLeft: mix(rig.upperArmLeft, nearArm.upper, rig.grip),
    forearmLeft: mix(rig.forearmLeft, nearArm.lower, rig.grip),
    upperArmRight: mix(rig.upperArmRight, farArm.upper, rig.grip),
    forearmRight: mix(rig.forearmRight, farArm.lower, rig.grip),
    thighLeft: nearLeg.upper,
    shinLeft: nearLeg.lower,
    thighRight: farLeg.upper,
    shinRight: farLeg.lower,
  }
}

/** Free-arm angles (relative to torso plus chest) that put a hand on a stage point. */
export function reachArm(
  input: PushRig,
  side: 'near' | 'far',
  target: { x: number; y: number },
) {
  const rig = driven(input)
  const shoulder = shoulderStage(rig)
  const local = rotate(
    -(target.x - shoulder.x),
    target.y - shoulder.y,
    -(rig.torso + rig.chest),
  )
  const bend = side === 'near' ? NEAR_ARM_BEND : FAR_ARM_BEND
  const arm = solveTwoBone(UPPER_ARM_LENGTH, FOREARM_LENGTH, local.x, local.y, bend)
  return { upper: arm.upper, fore: arm.lower }
}

function setRotate(svg: SVGSVGElement, id: string, degrees: number) {
  svg.getElementById(id)?.setAttribute('transform', `rotate(${degrees})`)
}

/** Writes the rig straight to the stage SVG, bypassing React for each frame. */
export function applyRig(svg: SVGSVGElement, rig: PushRig) {
  const pose = rigToPose(rig)
  svg
    .getElementById('character-root')
    ?.setAttribute('transform', `translate(${rig.hipX + rig.drive} ${rig.hipY})`)
  svg.getElementById('knob')?.setAttribute('cx', String(rig.knobX))
  setRotate(svg, 'torso-pivot', pose.torso)
  setRotate(svg, 'chest-pivot', pose.chest)
  svg.getElementById('torso')?.setAttribute('d', spinePath(pose.chest))
  setRotate(svg, 'head-pivot', pose.head)
  setRotate(svg, 'upper-arm-left-pivot', pose.upperArmLeft)
  setRotate(svg, 'forearm-left-pivot', pose.forearmLeft)
  setRotate(svg, 'upper-arm-right-pivot', pose.upperArmRight)
  setRotate(svg, 'forearm-right-pivot', pose.forearmRight)
  setRotate(svg, 'thigh-left-pivot', pose.thighLeft)
  setRotate(svg, 'shin-left-pivot', pose.shinLeft)
  setRotate(svg, 'thigh-right-pivot', pose.thighRight)
  setRotate(svg, 'shin-right-pivot', pose.shinRight)
}

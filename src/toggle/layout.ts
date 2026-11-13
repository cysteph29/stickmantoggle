/**
 * Shared stage geometry for the static toggle playground.
 *
 * SVG user space: x grows right, y grows down. Angles are degrees.
 * Limb angle 0 points down (+y) and positive rotation is clockwise.
 * Forearm and shin angles are relative to the parent limb.
 * Torso angle 0 is upright (drawn toward -y). Positive torso rotation
 * leans the head toward +x. Head angle is relative to the torso.
 *
 * The rest pose is authored facing -x. The stage mirrors it on
 * `#character-facing`, so the figure stands to the left of the knob
 * and faces right. Stroke widths here match the track and knob rules
 * in index.css.
 */

export type KnobSide = 'left' | 'right'

export type StickPose = {
  torso: number
  /** Upper-spine bend at the chest, relative to the torso. Negative rounds forward. */
  chest: number
  head: number
  upperArmLeft: number
  forearmLeft: number
  upperArmRight: number
  forearmRight: number
  thighLeft: number
  shinLeft: number
  thighRight: number
  shinRight: number
}

export const VIEW_W = 1400
export const VIEW_H = 820

export const TRACK_STROKE = 3
export const KNOB_STROKE = 3

/** Capsule radius. The track is taller than the knob. */
export const TRACK_RADIUS = 180
/** Knob radius. Large next to the figure, short of the track ceiling. */
export const KNOB_RADIUS = 148

const STAGE_PAD_X = 80
const STAGE_PAD_Y = (VIEW_H - TRACK_RADIUS * 2) / 2

export const TRACK_CY = STAGE_PAD_Y + TRACK_RADIUS

/** Inner edge of the track floor. Feet and the knob's outer stroke sit here. */
export const GROUND_Y = TRACK_CY + TRACK_RADIUS - TRACK_STROKE / 2

/** Knob center. The bottom of its stroke rests on the floor, leaving a gap above. */
export const KNOB_Y = GROUND_Y - KNOB_STROKE / 2 - KNOB_RADIUS

/**
 * Flat floor from each end-cap junction to the circle. The braced figure
 * then stands close to the round, with a small margin before the curve.
 */
export const END_STAND = 100

const TRACK_OUTER_W = VIEW_W - STAGE_PAD_X * 2
const TRACK_STRAIGHT = TRACK_OUTER_W - TRACK_RADIUS * 2 - TRACK_STROKE

/** Distance between the left and right knob centers. */
export const KNOB_TRAVEL = TRACK_STRAIGHT - END_STAND * 2 - KNOB_RADIUS * 2

/** Centers of the track's rounded ends. The floor is flat between them. */
export const TRACK_LEFT = STAGE_PAD_X + TRACK_STROKE / 2 + TRACK_RADIUS
export const TRACK_RIGHT = TRACK_LEFT + TRACK_STRAIGHT

/** Knob center when it rests at the left standing room. */
export const KNOB_LEFT_X = TRACK_LEFT + END_STAND + KNOB_RADIUS
/** Knob center when it rests at the right standing room. */
export const KNOB_RIGHT_X = KNOB_LEFT_X + KNOB_TRAVEL

export const HEAD_RADIUS = 20
export const NECK_LENGTH = 10
export const TORSO_LENGTH = 64
export const SHOULDER_DROP = 12
export const UPPER_ARM_LENGTH = 38
export const FOREARM_LENGTH = 34
export const THIGH_LENGTH = 48
export const SHIN_LENGTH = 46

/** Shoulder joint, in torso-local space. Negative y is up the torso. */
export const SHOULDER_Y = -(TORSO_LENGTH - SHOULDER_DROP)

/** Chest joint, in torso-local space. The upper spine, arms and head bend here. */
export const CHEST_Y = -30

/** Torso-local shoulder position for a chest bend. */
export function shoulderLocal(chest: number) {
  const upper = rotate(0, SHOULDER_Y - CHEST_Y, chest)
  return { x: upper.x, y: CHEST_Y + upper.y }
}

/** Spine as one smooth curve from the hip through the chest to the neck. */
export function spinePath(chest: number) {
  const neck = rotate(0, -TORSO_LENGTH - CHEST_Y, chest)
  return `M 0 0 Q 0 ${CHEST_Y} ${neck.x} ${CHEST_Y + neck.y}`
}

export const JOINT_RADIUS = 4.5
export const MARKER_RADIUS = 8

const DEG = Math.PI / 180

/**
 * Two-bone solve in rig-local space (angle 0 points +y, clockwise positive).
 * `bend` picks the side the middle joint folds toward; -1 folds a knee
 * toward the knob. Out-of-reach targets straighten the limb toward them.
 */
export function solveTwoBone(
  l1: number,
  l2: number,
  dx: number,
  dy: number,
  bend: number,
) {
  const reach = Math.hypot(dx, dy)
  const d = Math.min(Math.max(reach, Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01)
  const base = Math.atan2(-dx, dy)
  const root = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))
  const mid = Math.acos((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2))
  return {
    upper: (base - bend * root) / DEG,
    lower: (bend * (Math.PI - mid)) / DEG,
  }
}

/** Hip-to-ankle drop of the rest stance. Both feet sit on the floor. */
const STANCE_DROP = 84
/** Rest split stance, in local x (+ is behind the hip once mirrored). */
const REST_BACK_FOOT_X = 32
const REST_FRONT_FOOT_X = -27

const restBackLeg = solveTwoBone(THIGH_LENGTH, SHIN_LENGTH, REST_BACK_FOOT_X, STANCE_DROP, -1)
const restFrontLeg = solveTwoBone(THIGH_LENGTH, SHIN_LENGTH, REST_FRONT_FOOT_X, STANCE_DROP, -1)

/**
 * Braced pushing stance. Left limbs are the near side; right limbs are
 * the far side. Local +reach is toward -x, before the stage mirror.
 */
export const INITIAL_POSE: StickPose = {
  torso: -7,
  chest: 0,
  head: 5,
  upperArmLeft: 85,
  forearmLeft: 70,
  upperArmRight: 55,
  forearmRight: 75,
  thighLeft: restFrontLeg.upper,
  shinLeft: restFrontLeg.lower,
  thighRight: restBackLeg.upper,
  shinRight: restBackLeg.lower,
}

export function rotate(x: number, y: number, degrees: number) {
  const angle = degrees * DEG
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return { x: x * cos - y * sin, y: x * sin + y * cos }
}

/** End point of a limb whose local +y axis points down at 0°. */
export function limbEnd(length: number, degrees: number) {
  return rotate(0, length, degrees)
}

export function footLocal(thigh: number, shin: number) {
  const knee = limbEnd(THIGH_LENGTH, thigh)
  const shinEnd = limbEnd(SHIN_LENGTH, thigh + shin)
  return { x: knee.x + shinEnd.x, y: knee.y + shinEnd.y }
}

export function handLocal(upper: number, forearm: number, torso: number) {
  const elbow = limbEnd(UPPER_ARM_LENGTH, upper)
  const foreEnd = limbEnd(FOREARM_LENGTH, upper + forearm)
  const shoulder = rotate(0, SHOULDER_Y, torso)
  const hand = rotate(elbow.x + foreEnd.x, elbow.y + foreEnd.y, torso)
  return { x: shoulder.x + hand.x, y: shoulder.y + hand.y }
}

export const CHARACTER_HIP_Y = GROUND_Y - STANCE_DROP

const nearHand = handLocal(
  INITIAL_POSE.upperArmLeft,
  INITIAL_POSE.forearmLeft,
  INITIAL_POSE.torso,
)
const farHand = handLocal(
  INITIAL_POSE.upperArmRight,
  INITIAL_POSE.forearmRight,
  INITIAL_POSE.torso,
)

/** Hip x that puts a mirrored hand on the knob's left edge. */
function hipXForHand(hand: { x: number; y: number }, knobX: number) {
  const dy = CHARACTER_HIP_Y + hand.y - KNOB_Y
  const reach = Math.sqrt(KNOB_RADIUS * KNOB_RADIUS - dy * dy)
  return knobX - reach + hand.x
}

/** Places both wrists on the left knob. The mirror makes local -x point right. */
export const CHARACTER_HIP_X = Math.max(
  hipXForHand(nearHand, KNOB_LEFT_X),
  hipXForHand(farHand, KNOB_LEFT_X),
)

export function knobCenterX(side: KnobSide) {
  return side === 'left' ? KNOB_LEFT_X : KNOB_RIGHT_X
}

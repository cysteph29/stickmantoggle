import {
  CHEST_Y,
  FOREARM_LENGTH,
  HEAD_RADIUS,
  INITIAL_POSE,
  JOINT_RADIUS,
  MARKER_RADIUS,
  NECK_LENGTH,
  SHIN_LENGTH,
  SHOULDER_Y,
  THIGH_LENGTH,
  TORSO_LENGTH,
  UPPER_ARM_LENGTH,
  spinePath,
  type StickPose,
} from '../toggle/layout.ts'

type Side = 'left' | 'right'

type StickFigureProps = {
  hipX: number
  hipY: number
  pose?: StickPose
  /** Whole-body rotation around the hip, in degrees. Rest is 0. */
  rotation?: number
  showJoints?: boolean
}

function Joint({ showMarker }: { showMarker: boolean }) {
  return (
    <>
      <circle className="joint-dot" r={JOINT_RADIUS} cx={0} cy={0} />
      {showMarker ? (
        <circle className="joint-marker" r={MARKER_RADIUS} cx={0} cy={0} />
      ) : null}
    </>
  )
}

function Leg({
  side,
  thigh,
  shin,
  showJoints,
}: {
  side: Side
  thigh: number
  shin: number
  showJoints: boolean
}) {
  return (
    <g id={`thigh-${side}-pivot`} transform={`rotate(${thigh})`}>
      <line
        id={`thigh-${side}`}
        className="limb"
        x1={0}
        y1={0}
        x2={0}
        y2={THIGH_LENGTH}
      />
      <g id={`knee-${side}`} transform={`translate(0 ${THIGH_LENGTH})`}>
        <g id={`shin-${side}-pivot`} transform={`rotate(${shin})`}>
          <line
            id={`shin-${side}`}
            className="limb"
            x1={0}
            y1={0}
            x2={0}
            y2={SHIN_LENGTH}
          />
          <g id={`ankle-${side}`} transform={`translate(0 ${SHIN_LENGTH})`}>
            <Joint showMarker={showJoints} />
          </g>
        </g>
        <Joint showMarker={showJoints} />
      </g>
    </g>
  )
}

function Arm({
  side,
  upper,
  forearm,
  showJoints,
}: {
  side: Side
  upper: number
  forearm: number
  showJoints: boolean
}) {
  return (
    <g id={`upper-arm-${side}-pivot`} transform={`rotate(${upper})`}>
      <line
        id={`upper-arm-${side}`}
        className="limb"
        x1={0}
        y1={0}
        x2={0}
        y2={UPPER_ARM_LENGTH}
      />
      <g id={`elbow-${side}`} transform={`translate(0 ${UPPER_ARM_LENGTH})`}>
        <g id={`forearm-${side}-pivot`} transform={`rotate(${forearm})`}>
          <line
            id={`forearm-${side}`}
            className="limb"
            x1={0}
            y1={0}
            x2={0}
            y2={FOREARM_LENGTH}
          />
          <g id={`wrist-${side}`} transform={`translate(0 ${FOREARM_LENGTH})`}>
            <Joint showMarker={showJoints} />
          </g>
        </g>
        <Joint showMarker={showJoints} />
      </g>
    </g>
  )
}

export function StickFigure({
  hipX,
  hipY,
  pose = INITIAL_POSE,
  rotation = 0,
  showJoints = false,
}: StickFigureProps) {
  return (
    <g id="character-root" transform={`translate(${hipX} ${hipY})`}>
      {/* Pose faces -x. This mirror turns the braced stance toward +x. */}
      <g id="character-facing" transform="scale(-1 1)">
      <g id="character-body" transform={`rotate(${rotation})`}>
        <Leg
          side="right"
          thigh={pose.thighRight}
          shin={pose.shinRight}
          showJoints={showJoints}
        />
        <Leg
          side="left"
          thigh={pose.thighLeft}
          shin={pose.shinLeft}
          showJoints={showJoints}
        />

        <g id="torso-pivot" transform={`rotate(${pose.torso})`}>
          <path id="torso" className="limb" d={spinePath(pose.chest)} />

          <g id="chest" transform={`translate(0 ${CHEST_Y})`}>
          <g id="chest-pivot" transform={`rotate(${pose.chest})`}>
          <g id="shoulder" transform={`translate(0 ${SHOULDER_Y - CHEST_Y})`}>
            <Arm
              side="right"
              upper={pose.upperArmRight}
              forearm={pose.forearmRight}
              showJoints={showJoints}
            />
            <Arm
              side="left"
              upper={pose.upperArmLeft}
              forearm={pose.forearmLeft}
              showJoints={showJoints}
            />
            <Joint showMarker={showJoints} />
          </g>

          <g id="neck" transform={`translate(0 ${-TORSO_LENGTH - CHEST_Y})`}>
            <line
              id="neck-line"
              className="limb"
              x1={0}
              y1={0}
              x2={0}
              y2={-NECK_LENGTH}
            />
            <g id="head-base" transform={`translate(0 ${-NECK_LENGTH})`}>
              <g id="head-pivot" transform={`rotate(${pose.head})`}>
                <circle
                  id="head"
                  className="head"
                  cx={0}
                  cy={-HEAD_RADIUS}
                  r={HEAD_RADIUS}
                />
                <circle
                  id="eye"
                  className="eye"
                  cx={-HEAD_RADIUS * 0.34}
                  cy={-HEAD_RADIUS * 1.12}
                  r={2.2}
                />
                <Joint showMarker={showJoints} />
              </g>
            </g>
            <Joint showMarker={showJoints} />
          </g>
          </g>
          </g>
        </g>

        <g id="hip">
          <Joint showMarker={showJoints} />
        </g>
      </g>
      </g>
    </g>
  )
}

import type { Ref } from 'react'
import { INITIAL_RIG, rigToPose } from '../toggle/pushRig.ts'
import { StickFigure } from './StickFigure.tsx'
import {
  KNOB_RADIUS,
  KNOB_Y,
  TRACK_CY,
  TRACK_LEFT,
  TRACK_RADIUS,
  TRACK_RIGHT,
  VISIBLE_TRACK_TOP,
  VIEW_H,
  VIEW_W,
} from '../toggle/layout.ts'

type ToggleStageProps = {
  knobX: number
  hipX: number
  hipY: number
  showJoints: boolean
  svgRef?: Ref<SVGSVGElement>
  onKnobClick?: () => void
}

// Visible outline only: shared track geometry still defines the animation.
const VISIBLE_TRACK_RIGHT = TRACK_RIGHT - 248
const VISIBLE_TRACK_BOTTOM = TRACK_CY + TRACK_RADIUS
// Narrower elliptical caps keep the wide pushing stance over the flat floor.
const VISIBLE_CAP_RX = 120
const VISIBLE_CAP_RY = (VISIBLE_TRACK_BOTTOM - VISIBLE_TRACK_TOP) / 2
// Center the visible outline as one composition without changing rig coordinates.
const VISIBLE_TRACK_MIN_X = TRACK_LEFT - TRACK_RADIUS
const VISIBLE_TRACK_MAX_X = VISIBLE_TRACK_RIGHT + TRACK_RADIUS
const COMPOSITION_OFFSET_X = VIEW_W / 2 - (VISIBLE_TRACK_MIN_X + VISIBLE_TRACK_MAX_X) / 2

function trackPath() {
  const x1 = TRACK_LEFT - TRACK_RADIUS + VISIBLE_CAP_RX
  const x2 = VISIBLE_TRACK_RIGHT + TRACK_RADIUS - VISIBLE_CAP_RX
  return [
    `M ${x1} ${VISIBLE_TRACK_TOP}`,
    `H ${x2}`,
    `A ${VISIBLE_CAP_RX} ${VISIBLE_CAP_RY} 0 0 1 ${x2} ${VISIBLE_TRACK_BOTTOM}`,
    `H ${x1}`,
    `A ${VISIBLE_CAP_RX} ${VISIBLE_CAP_RY} 0 0 1 ${x1} ${VISIBLE_TRACK_TOP}`,
    'Z',
  ].join(' ')
}

export function ToggleStage({
  knobX,
  hipX,
  hipY,
  showJoints,
  svgRef,
  onKnobClick,
}: ToggleStageProps) {
  return (
    <div className="stage">
      <svg
        ref={svgRef}
        id="toggle-stage"
        className="stage-svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label="Large horizontal toggle. A stick figure stands to the left of the knob, facing it."
      >
        <g transform={`translate(${COMPOSITION_OFFSET_X} 0)`}>
          <path id="track" className="track" d={trackPath()} />
          <circle
            id="knob"
            className="knob"
            cx={knobX}
            cy={KNOB_Y}
            r={KNOB_RADIUS}
            onClick={onKnobClick}
          />
          <StickFigure
            pose={rigToPose({ ...INITIAL_RIG, hipX, hipY, knobX })}
            hipX={hipX}
            hipY={hipY}
            showJoints={showJoints}
          />
        </g>
      </svg>
    </div>
  )
}

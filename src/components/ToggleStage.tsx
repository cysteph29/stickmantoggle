import type { Ref } from 'react'
import { uniformRig, UNIFORM_EXPANSION } from '../toggle/uniformRig.ts'
import { rigToPose, type PushRig } from '../toggle/pushRig.ts'
import { StickFigure } from './StickFigure.tsx'
import {
  KNOB_RADIUS,
  KNOB_RIGHT_X,
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
  uniform?: boolean
  viewBox?: string
  rig: PushRig
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

function trackPath(uniform = false) {
  const expansion = uniform ? UNIFORM_EXPANSION : 0
  const top = VISIBLE_TRACK_TOP - expansion
  const bottom = VISIBLE_TRACK_BOTTOM + expansion
  const ry = VISIBLE_CAP_RY + expansion
  const x1 = TRACK_LEFT - TRACK_RADIUS + VISIBLE_CAP_RX
  // The circular alternate cap shares the settled knob center.
  const rightRadius = uniform ? ry : VISIBLE_CAP_RX
  const x2 = uniform ? KNOB_RIGHT_X : VISIBLE_TRACK_RIGHT + TRACK_RADIUS - VISIBLE_CAP_RX
  return [
    `M ${x1} ${top}`,
    `H ${x2}`,
    `A ${rightRadius} ${ry} 0 0 1 ${x2} ${bottom}`,
    `H ${x1}`,
    `A ${VISIBLE_CAP_RX} ${ry} 0 0 1 ${x1} ${top}`,
    'Z',
  ].join(' ')
}

export function ToggleStage({
  uniform = false,
  viewBox = `0 0 ${VIEW_W} ${VIEW_H}`,
  rig,
  showJoints,
  svgRef,
  onKnobClick,
}: ToggleStageProps) {
  const figureRig = uniform ? uniformRig(rig) : rig
  return (
    <div className="stage">
      <svg
        ref={svgRef}
        id="toggle-stage"
        className={uniform ? 'stage-svg stage-svg--uniform' : 'stage-svg'}
        viewBox={viewBox}
        role="img"
        aria-label="Large horizontal toggle. A stick figure stands to the left of the knob, facing it."
      >
        <g transform={`translate(${COMPOSITION_OFFSET_X} 0)`}>
          <path id="track" className="track" d={trackPath(uniform)} />
          <circle
            id="knob"
            className="knob"
            cx={rig.knobX}
            cy={KNOB_Y}
            r={KNOB_RADIUS}
            onClick={onKnobClick}
          />
          <defs>
            <clipPath id="walk-reveal" clipPathUnits="userSpaceOnUse">
              <path d={trackPath(uniform)} />
              {/* The original ankle dots overhang the flat floor by 3px.
                  Retain that stroke overflow once inside the flat span,
                  so removing the entrance clip cannot reveal extra pixels. */}
              <rect x={TRACK_LEFT - TRACK_RADIUS + VISIBLE_CAP_RX}
                y={VISIBLE_TRACK_BOTTOM + (uniform ? UNIFORM_EXPANSION : 0)} width={VISIBLE_TRACK_RIGHT - TRACK_LEFT}
                height={5} />
            </clipPath>
          </defs>
          <g id="walk-actor" opacity="0">
            <StickFigure pose={rigToPose(figureRig)}
              hipX={figureRig.hipX + figureRig.drive} hipY={figureRig.hipY} showJoints={showJoints} />
          </g>
        </g>
      </svg>
    </div>
  )
}

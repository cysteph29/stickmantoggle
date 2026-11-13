import type { Ref } from 'react'
import { StickFigure } from './StickFigure.tsx'
import {
  KNOB_RADIUS,
  KNOB_Y,
  TRACK_CY,
  TRACK_LEFT,
  TRACK_RADIUS,
  TRACK_RIGHT,
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

function trackPath() {
  const r = TRACK_RADIUS
  const y = TRACK_CY
  const x1 = TRACK_LEFT
  const x2 = TRACK_RIGHT
  return [
    `M ${x1} ${y - r}`,
    `H ${x2}`,
    `A ${r} ${r} 0 0 1 ${x2} ${y + r}`,
    `H ${x1}`,
    `A ${r} ${r} 0 0 1 ${x1} ${y - r}`,
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
          hipX={hipX}
          hipY={hipY}
          showJoints={showJoints}
        />
      </svg>
    </div>
  )
}

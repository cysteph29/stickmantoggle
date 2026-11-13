import type { KnobSide } from '../toggle/layout.ts'

type DebugPanelProps = {
  knobSide: KnobSide
  showJoints: boolean
  onKnobSide: (side: KnobSide) => void
  onShowJoints: (show: boolean) => void
  onReset: () => void
}

export function DebugPanel({
  knobSide,
  showJoints,
  onKnobSide,
  onShowJoints,
  onReset,
}: DebugPanelProps) {
  return (
    <aside className="debug-panel" aria-label="Debug controls">
      <div className="debug-field">
        <span id="knob-position-label">Knob</span>
        <div className="debug-choices" role="group" aria-labelledby="knob-position-label">
          <button
            type="button"
            aria-pressed={knobSide === 'left'}
            onClick={() => onKnobSide('left')}
          >
            Left
          </button>
          <button
            type="button"
            aria-pressed={knobSide === 'right'}
            onClick={() => onKnobSide('right')}
          >
            Right
          </button>
        </div>
      </div>
      <label className="debug-check">
        <input
          type="checkbox"
          checked={showJoints}
          onChange={(event) => onShowJoints(event.target.checked)}
        />
        Joint markers
      </label>
      <button type="button" onClick={onReset}>
        Reset
      </button>
    </aside>
  )
}

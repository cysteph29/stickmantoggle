import { useEffect, useRef, useState } from 'react'
import { DebugPanel } from './components/DebugPanel.tsx'
import { ToggleStage } from './components/ToggleStage.tsx'
import {
  CHARACTER_HIP_X,
  CHARACTER_HIP_Y,
  knobCenterX,
} from './toggle/layout.ts'
import type { KnobSide } from './toggle/layout.ts'
import { INITIAL_RIG, applyRig } from './toggle/pushRig.ts'
import { createPushTimeline } from './toggle/pushTimeline.ts'

const INITIAL_KNOB_SIDE: KnobSide = 'left'

/** Debug controls stay off unless the page is opened with `?debug`. */
const SHOW_DEBUG = new URLSearchParams(window.location.search).has('debug')

export default function App() {
  const [knobSide, setKnobSide] = useState<KnobSide>(INITIAL_KNOB_SIDE)
  const [showJoints, setShowJoints] = useState(SHOW_DEBUG)
  const [hipX, setHipX] = useState(CHARACTER_HIP_X)
  const [hipY, setHipY] = useState(CHARACTER_HIP_Y)
  const svgRef = useRef<SVGSVGElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => () => void timelineRef.current?.kill(), [])

  /** Stops any push and writes the rest pose back over the animated DOM. */
  function restoreRestPose(side: KnobSide) {
    timelineRef.current?.kill()
    timelineRef.current = null
    document.documentElement.style.setProperty('--theme', side === 'right' ? '1' : '0')
    document.documentElement.style.setProperty('--figure-theme', side === 'right' ? '1' : '0')
    if (svgRef.current) {
      applyRig(svgRef.current, { ...INITIAL_RIG, knobX: knobCenterX(side) })
    }
  }

  function push() {
    if (knobSide !== 'left' || timelineRef.current || !svgRef.current) return
    timelineRef.current = createPushTimeline(
      svgRef.current,
      () => setKnobSide('right'),
    )
  }

  function chooseKnobSide(side: KnobSide) {
    restoreRestPose(side)
    setKnobSide(side)
  }

  function reset() {
    restoreRestPose(INITIAL_KNOB_SIDE)
    setKnobSide(INITIAL_KNOB_SIDE)
    setHipX(CHARACTER_HIP_X)
    setHipY(CHARACTER_HIP_Y)
  }

  return (
    <main className="page">
      {SHOW_DEBUG && (
        <DebugPanel
          knobSide={knobSide}
          showJoints={showJoints}
          onKnobSide={chooseKnobSide}
          onShowJoints={setShowJoints}
          onReset={reset}
        />
      )}
      <ToggleStage
        knobX={knobCenterX(knobSide)}
        hipX={hipX}
        hipY={hipY}
        showJoints={showJoints}
        svgRef={svgRef}
        onKnobClick={push}
      />
      <footer className="social-links" aria-label="Social links">
        <a href="https://github.com/cysteph29" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/cyril-stephen" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="https://x.com/cyril_design" target="_blank" rel="noopener noreferrer">X</a>
      </footer>
    </main>
  )
}

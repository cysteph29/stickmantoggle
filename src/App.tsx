import { useEffect, useRef, useState } from 'react'
import { DebugPanel } from './components/DebugPanel.tsx'
import { ToggleStage } from './components/ToggleStage.tsx'
import {
  knobCenterX,
} from './toggle/layout.ts'
import type { KnobSide } from './toggle/layout.ts'
import { INITIAL_RIG, applyRig, type PushRig } from './toggle/pushRig.ts'
import { createPushTimeline } from './toggle/pushTimeline.ts'

import { createWalkPushTimeline } from './toggle/walkPush.ts'
import { WALK_REST } from './toggle/walkComposition.ts'
import { createWalkIntro, prepareWalk } from './toggle/walkIntro.ts'
import { PortfolioOutro, PortfolioType } from './components/PortfolioOutro.tsx'

const WALK_INTRO = new URLSearchParams(window.location.search).get('intro') === 'walk'
const PORTFOLIO_OUTRO = WALK_INTRO
  && new URLSearchParams(window.location.search).get('outro') === 'portfolio'
const PORTFOLIO_PREVIEW = PORTFOLIO_OUTRO
  && new URLSearchParams(window.location.search).get('preview') === 'outro'

const INITIAL_KNOB_SIDE: KnobSide = 'left'

/** Debug controls stay off unless the page is opened with `?debug`. */
const SHOW_DEBUG = new URLSearchParams(window.location.search).has('debug')

export default function App() {
  return PORTFOLIO_PREVIEW ? <PortfolioOutro /> : <TogglePlayground />
}

function TogglePlayground() {
  const [outroVisible, setOutroVisible] = useState(false)
  const [knobSide, setKnobSide] = useState<KnobSide>(INITIAL_KNOB_SIDE)
  const [showJoints, setShowJoints] = useState(SHOW_DEBUG)
  const [renderRig, setRenderRig] = useState<PushRig>(WALK_INTRO ? WALK_REST : INITIAL_RIG)
  const svgRef = useRef<SVGSVGElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => () => void timelineRef.current?.kill(), [])

  /** Stops any push and writes the rest pose back over the animated DOM. */
  function restoreRestPose(side: KnobSide) {
    setOutroVisible(false)
    timelineRef.current?.kill()
    timelineRef.current = null
    document.documentElement.style.setProperty('--theme', side === 'right' ? '1' : '0')
    document.documentElement.style.setProperty('--figure-theme', side === 'right' ? '1' : '0')
    const rest = WALK_INTRO && side === 'left'
      ? WALK_REST
      : { ...INITIAL_RIG, knobX: knobCenterX(side) }
    setRenderRig(rest)
    if (svgRef.current) {
      applyRig(svgRef.current, rest)
      if (WALK_INTRO) prepareWalk(svgRef.current)
    }
  }

  function push() {
    if (knobSide !== 'left' || timelineRef.current || !svgRef.current) return
    const svg = svgRef.current
    const startPush = () => {
      svg.getElementById('walk-actor')?.setAttribute('opacity', '1')
      timelineRef.current = (WALK_INTRO ? createWalkPushTimeline : createPushTimeline)(svg, (finishedRig) => {
        // React must reconcile the completed pose, not a new initial grip.
        setRenderRig(finishedRig)
        setKnobSide('right')
        timelineRef.current = null
      })
      if (PORTFOLIO_OUTRO) {
        timelineRef.current.call(() => setOutroVisible(true), [], 'closeStance')
      }
    }
    if (WALK_INTRO && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timelineRef.current = createWalkIntro(svg, startPush)
    } else {
      startPush()
    }
  }

  function chooseKnobSide(side: KnobSide) {
    restoreRestPose(side)
    setKnobSide(side)
  }

  function reset() {
    restoreRestPose(INITIAL_KNOB_SIDE)
    setKnobSide(INITIAL_KNOB_SIDE)
  }

  return (
    <main className={`page${PORTFOLIO_OUTRO ? ' portfolio-reveal' : ''}${outroVisible ? ' is-revealed' : ''}`}>
      {PORTFOLIO_OUTRO && <PortfolioType />}
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
        walkIntro={WALK_INTRO}
        rig={renderRig}
        showJoints={showJoints}
        svgRef={svgRef}
        onKnobClick={push}
      />
    </main>
  )
}

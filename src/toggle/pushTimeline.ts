/**
 * Left-to-right push: settle, failed first push, recoil, wider stance,
 * second push, the break that pitches the figure forward, and the stumble
 * after it. It ends bent over mid-track, where the recovery will start.
 *
 * Offsets are stage pixels from the rest rig. +x is toward the knob and
 * +y is down. A more negative torso angle leans further into the knob.
 */
import gsap from 'gsap'
import {
  CHEST_Y,
  FOREARM_LENGTH,
  KNOB_RIGHT_X,
  SHIN_LENGTH,
  THIGH_LENGTH,
  UPPER_ARM_LENGTH,
  limbEnd,
  rotate,
  shoulderLocal,
  solveTwoBone,
} from './layout.ts'
import {
  INITIAL_RIG,
  applyRig,
  rigToPose,
  type PushRig,
} from './pushRig.ts'

const R = INITIAL_RIG

/**
 * Six quick-then-slowing steps ending bent over, or four long lurching
 * steps ending with hands on knees.
 */
export type StumbleVariant = 'six' | 'four'

export function createPushTimeline(
  svg: SVGSVGElement,
  onComplete: () => void,
  variant: StumbleVariant = 'six',
) {
  const rig: PushRig = { ...INITIAL_RIG }

  /**
   * Strain tremor on the upper body only. Torso and head each run on their
   * own period and phase, so the shudder doesn't lock into one vibration.
   * The upper spine takes the opposite bend of the torso so the shoulder
   * stays put; a shaking shoulder makes the arm IK pump the elbows, and
   * with the arms nearly straight that pump locks the joint. The hip is
   * not driven. Amplitude fades in over the first 20%, holds, and fades
   * out over the last 30%.
   *
   * The offset is added for the render and then taken back off the rig, so
   * a tween that starts during the window captures the authored pose.
   *
   * Length stays on the old 0.05s grid. 0.55s still lasts 0.6s and 0.7s
   * still lasts 0.8s; the first call is appended, and a shorter tween would
   * pull the recoil and everything after it forward.
   */
  type TremorKey = 'torso' | 'head' | 'chest'
  // Chest unbends by the shoulder arc the torso lean would add, so the
  // shoulder stays put and the arm IK doesn't turn a 2° shiver into a
  // straightening elbow. Hip-to-shoulder over chest-to-shoulder.
  const shoulderHold =
    Math.abs(shoulderLocal(0).y) / (Math.abs(shoulderLocal(0).y) - Math.abs(CHEST_Y))
  type Tremor = {
    tween: gsap.core.Tween
    channels: { key: TremorKey; amp: number; period: number; phase: number }[]
  }
  const tremors: Tremor[] = []
  const fade = (u: number) => {
    const x = Math.min(1, Math.max(0, u))
    return x * x * (3 - 2 * x)
  }
  const tremorEnvelope = (p: number) => {
    if (p < 0.2) return fade(p / 0.2)
    if (p > 0.7) return fade((1 - p) / 0.3)
    return 1
  }

  const tl = gsap.timeline({
    onUpdate() {
      const now = this.time()
      const undo: { key: TremorKey; value: number }[] = []
      for (const tremor of tremors) {
        const total = tremor.tween.duration()
        const local = now - tremor.tween.startTime()
        if (local <= 0 || local >= total) continue
        const env = tremorEnvelope(local / total)
        for (const channel of tremor.channels) {
          const delta =
            env *
            channel.amp *
            Math.sin((2 * Math.PI * local) / channel.period + channel.phase)
          if (!undo.some((entry) => entry.key === channel.key)) {
            undo.push({ key: channel.key, value: rig[channel.key] })
          }
          rig[channel.key] += delta
          if (channel.key === 'torso') {
            if (!undo.some((entry) => entry.key === 'chest')) {
              undo.push({ key: 'chest', value: rig.chest })
            }
            rig.chest -= shoulderHold * delta
          }
        }
      }
      applyRig(svg, rig)
      for (const entry of undo) rig[entry.key] = entry.value
    },
    onComplete,
  })

  const tremble = (amount: number, duration: number) => {
    const repeats = Math.round(duration / 0.05)
    const total = 0.05 * ((repeats % 2 ? repeats : repeats + 1) + 1)
    const tween = gsap.to({ p: 0 }, { p: 1, duration: total, ease: 'none' })
    // 0.043s and 0.067s both sit in 0.04–0.09s, and they don't match.
    // The head is the slower of the two.
    tremors.push({
      tween,
      channels: [
        { key: 'torso', amp: amount, period: 0.043, phase: 0.4 },
        { key: 'head', amp: amount * 1.5, period: 0.067, phase: 2.2 },
      ],
    })
    return tween
  }

  // 1. Settle: sink and load the arms.
  tl.to(rig, {
    hipX: R.hipX - 6,
    hipY: R.hipY + 7,
    torso: -10,
    head: 12,
    gripDrop: 4,
    duration: 0.45,
    ease: 'power2.inOut',
  })

  // 2. First push: hips forward and down into the lean, hands level. The
  // knob barely budges.
  tl.addLabel('push1')
  tl.to(rig, {
    hipX: R.hipX + 2,
    hipY: R.hipY + 16,
    torso: -30,
    chest: -3,
    head: 24,
    gripDrop: 66,
    gripSpread: 0,
    duration: 0.5,
    ease: 'power3.out',
  })
  tl.to(rig, { knobX: R.knobX + 2, duration: 0.3, ease: 'power1.out' }, 'push1+=0.2')
  tl.add(tremble(1.2, 0.55))

  // 3. Recoil: the knob wins and pushes the body back. The knees and elbows
  // give to soak it up, the torso overshoots past -10, then everything eases.
  tl.addLabel('recoil')
  tl.to(rig, {
    hipX: R.hipX - 9,
    hipY: R.hipY + 0,
    torso: -6,
    head: 18,
    gripDrop: 15,
    duration: 0.14,
    ease: 'power2.out',
  })
  tl.to(rig, {
    hipX: R.hipX - 12,
    hipY: R.hipY + 0,
    torso: -10,
    gripDrop: 28,
    duration: 0.16,
    ease: 'sine.inOut',
  })
  tl.to(rig, { knobX: R.knobX, duration: 0.25, ease: 'power2.out' }, 'recoil')
  tl.to(rig, { head: 4, duration: 0.1, ease: 'sine.inOut' })
  tl.to(rig, { head: 12, duration: 0.1, ease: 'sine.inOut' })
  tl.to(rig, { head: 6, duration: 0.12, ease: 'sine.out' })

  // 4. Regroup: step the back foot well out for a long, low stance.
  tl.addLabel('step', '+=0.08')
  tl.to(rig, { backFootX: R.backFootX - 60, duration: 0.4, ease: 'power2.inOut' }, 'step')
  tl.to(rig, { backFootY: R.backFootY - 18, duration: 0.2, ease: 'power2.out' }, 'step')
  // The heel lands on the start of the end cap, which sits slightly higher.
  tl.to(rig, { backFootY: R.backFootY - 3, duration: 0.2, ease: 'power2.in' }, 'step+=0.2')
  // The front foot shuffles back so its knee can get over it in the drive.
  tl.to(rig, { frontFootX: R.frontFootX - 12, duration: 0.3, ease: 'power2.inOut' }, 'step+=0.1')
  tl.to(rig, {
    hipX: R.hipX - 22,
    hipY: R.hipY + 20,
    torso: -34,
    gripDrop: 0,
    gripSpread: 0.5,
    duration: 0.4,
    ease: 'power2.inOut',
  }, 'step')
  // Breath in, then the wind-up: the hip sinks below the heel-to-hands line
  // and the elbows load.
  tl.to(rig, { hipY: R.hipY + 18, torso: -30, head: 0, duration: 0.22, ease: 'sine.inOut' })
  tl.to(rig, {
    hipX: R.hipX - 24,
    hipY: R.hipY + 22,
    torso: -40,
    chest: -4,
    head: 40,
    gripDrop: -4,
    gripSpread: 0,
    duration: 0.38,
    ease: 'power2.inOut',
  })

  // 5. Second push: the legs drive the hip up onto one line from the back
  // heel through the shoulders to near-straight arms.
  tl.addLabel('push2')
  tl.to(rig, {
    hipX: R.hipX - 26,
    hipY: R.hipY + 15,
    torso: -50,
    chest: -6,
    gripDrop: -8,
    duration: 0.5,
    ease: 'power3.out',
  })
  // Chin tucked so the head sits under the arm line, guarding the neck.
  tl.to(rig, { head: -60, duration: 0.25, ease: 'power2.out' }, 'push2')
  tl.to(rig, { knobX: R.knobX + 3, duration: 0.3, ease: 'power1.out' }, 'push2+=0.2')
  tl.add(tremble(1.8, 0.7), 'push2+=0.5')
  // As the knob gives, the body drives after it along the line.
  tl.to(rig, { knobX: R.knobX + 6, duration: 0.15, ease: 'power2.out' }, 'push2+=0.75')
  tl.to(rig, { drive: 2.5, hipY: R.hipY + 19, gripDrop: -4, duration: 0.15, ease: 'power2.out' }, 'push2+=0.75')
  tl.to(rig, { knobX: R.knobX + 9, duration: 0.15, ease: 'power2.out' }, 'push2+=1.0')
  tl.to(rig, { drive: 4, hipY: R.hipY + 18.5, duration: 0.15, ease: 'power2.out' }, 'push2+=1.0')

  // 6. Break: the stored push releases all at once. The back leg's drive
  // launches the body forward before the feet can keep up.
  tl.addLabel('break', 'push2+=1.2')
  tl.to(rig, { knobX: KNOB_RIGHT_X, duration: 1.1, ease: 'expo.out' }, 'break')
  tl.to(rig, { grip: 0, duration: 0.05, ease: 'none' }, 'break')
  tl.to(rig, {
    upperArmLeft: 140,
    forearmLeft: 5,
    upperArmRight: 120,
    forearmRight: 15,
    duration: 0.14,
    ease: 'power3.out',
  }, 'break')
  tl.to(rig, { hipX: R.hipX + 70, drive: 0, duration: 0.2, ease: 'power3.out' }, 'break')
  tl.to(rig, { hipY: R.hipY + 12, duration: 0.2, ease: 'power2.in' }, 'break')
  tl.to(rig, { torso: -74, chest: 0, duration: 0.14, ease: 'power3.out' }, 'break')
  // Whiplash: the head snaps back, then follows the body down.
  tl.to(rig, { head: 58, duration: 0.08, ease: 'power2.out' }, 'break')
  tl.to(rig, { head: 16, duration: 0.2, ease: 'sine.inOut' }, 'break+=0.08')
  // The front foot shoots out into a desperate lunge.
  tl.to(rig, { frontFootX: R.frontFootX + 110, duration: 0.2, ease: 'power2.out' }, 'break+=0.02')
  tl.to(rig, { frontFootY: R.frontFootY - 18, duration: 0.09, ease: 'power2.out' }, 'break+=0.02')
  tl.to(rig, { frontFootY: R.frontFootY, duration: 0.11, ease: 'power2.in' }, 'break+=0.11')
  // The back foot kicks off and trails behind.
  tl.to(rig, {
    backFootX: R.backFootX - 40,
    backFootY: R.backFootY - 30,
    duration: 0.18,
    ease: 'power3.out',
  }, 'break')


  // 7. Stumble: the body falls ahead of the feet, and each landing bleeds off
  // a little speed until the figure catches itself, bent over and winded.
  /** Stage x as an offset from the rest hip. */
  const X = (dx: number) => R.hipX + dx
  tl.addLabel('stumble', 'break+=0.2')
  const at = (s: number) => `stumble+=${s}`

  // Six-step: one decaying glide carries the hip from the break to the catch.
  // Four-step: the hip is pulsed per footfall inside the four branch below.
  const four = variant === 'four'
  if (!four) {
    tl.to(rig, { hipX: X(340), duration: 2, ease: 'power1.out' }, 'break+=0.14')
    tl.to(rig, { hipY: R.hipY + 4, duration: 0.18, ease: 'sine.out' }, at(0))
    tl.to(rig, { torso: -77, duration: 0.12, ease: 'power2.out' }, at(0))
  }

  type Step = {
    foot: 'front' | 'back'
    /** Swing start and landing, from the stumble label. */
    start: number
    contact: number
    toX: number
    lift: number
    /**
     * Four-step only: foot height as it passes the standing ankle. The lift
     * peaks before that, while the foot is still behind the body.
     */
    clear?: number
    /** Hip drop as the landing leg absorbs the weight. */
    dip: number
    /** Hip height held until the next landing. */
    low: number
    torso: number
    /** Upward torso bump from the landing. */
    kick: number
    head: number
    bob: number
    ease: string
  }
  // Swing time stays near-constant; the hold before each next lift grows
  // (0, 0, 0.04, 0.11, 0.21, 0.34s), which is what reads as slowing down.
  // Stride peaks at steps 3 and 4.
  const sixSteps: Step[] = [
    { foot: 'back', start: 0, contact: 0.14, toX: X(145), lift: 20, dip: 6, low: 5, torso: -72, kick: 3, head: 16, bob: 4, ease: 'power3.out' },
    { foot: 'front', start: 0.14, contact: 0.29, toX: X(185), lift: 7, dip: 7, low: 8, torso: -68, kick: 3, head: 13, bob: 3.5, ease: 'power3.out' },
    { foot: 'back', start: 0.33, contact: 0.5, toX: X(242), lift: 10, dip: 9, low: 10, torso: -62, kick: 4, head: 9, bob: 3, ease: 'power2.out' },
    { foot: 'front', start: 0.61, contact: 0.8, toX: X(298), lift: 13, dip: 11, low: 11, torso: -55, kick: 5, head: 5, bob: 2.5, ease: 'power1.out' },
    { foot: 'back', start: 1.01, contact: 1.23, toX: X(345), lift: 14, dip: 12, low: 11, torso: -46, kick: 5, head: 0, bob: 2, ease: 'power1.inOut' },
    { foot: 'front', start: 1.57, contact: 1.83, toX: X(368), lift: 10, dip: 16, low: 16, torso: -34, kick: 0, head: -8, bob: 1, ease: 'sine.inOut' },
  ]
  // Long, heavy lurches under the still-surging body. Each lift waits longer
  // after the last landing (0.06, 0.08, 0.18s). The two middle strides are
  // the biggest, so the hip stays deep through them; the last step only drags
  // the front foot into place, leaving early so the gliding hip doesn't pull
  // that planted leg back across the other one.
  const fourSteps: Step[] = [
    { foot: 'back', start: 0, contact: 0.3, toX: X(184), lift: 22, clear: 12, dip: 14, low: 18, torso: -70, kick: 0, head: 16, bob: 3, ease: 'power2.out' },
    { foot: 'front', start: 0.36, contact: 0.82, toX: X(276), lift: 18, clear: 10, dip: 20, low: 17, torso: -60, kick: 0, head: 10, bob: 3, ease: 'power1.out' },
    // Shorter than the step before it, and short of the old landing, so the
    // catch stands about 40px further from the knob. It lands while the
    // gliding hip is still behind X(300).
    { foot: 'back', start: 0.9, contact: 1.28, toX: X(300), lift: 18, clear: 10, dip: 20, low: 16, torso: -46, kick: 0, head: 4, bob: 2.5, ease: 'power1.inOut' },
    // The drag step plants the front foot 44px ahead of that, a shorter
    // stride than the back foot just took.
    { foot: 'front', start: 1.46, contact: 2.1, toX: X(344), lift: 6, clear: 6, dip: 14, low: 14, torso: -20, kick: 0, head: 2, bob: 1.5, ease: 'sine.inOut' },
  ]
  const steps = four ? fourSteps : sixSteps
  // Where each foot sits when the stumble starts; the break has planted both.
  const footAt = { front: R.frontFootX + 110, back: R.backFootX - 40 }

  steps.forEach((s, i) => {
    const x = s.foot === 'front' ? 'frontFootX' : 'backFootX'
    const y = s.foot === 'front' ? 'frontFootY' : 'backFootY'
    const ground = s.foot === 'front' ? R.frontFootY : R.backFootY
    const swing = s.contact - s.start
    tl.to(rig, { [x]: s.toX, duration: swing, ease: s.ease }, at(s.start))
    const fromX = footAt[s.foot]
    const standX = footAt[s.foot === 'front' ? 'back' : 'front']
    footAt[s.foot] = s.toX
    if (s.clear !== undefined) {
      // Find when the swing foot draws level with the standing ankle, so it
      // can be low there; a foot still high at that moment folds the leg up
      // behind the body.
      const ease = gsap.parseEase(s.ease)
      const target = Math.min(Math.max((standX - fromX) / (s.toX - fromX), 0), 1)
      let lo = 0
      let hi = 1
      for (let k = 0; k < 30; k++) {
        const mid = (lo + hi) / 2
        if (ease(mid) < target) lo = mid
        else hi = mid
      }
      const pass = swing * lo
      if (i === 0) {
        // Already up from the kick-off: come straight down to the pass.
        tl.to(rig, { [y]: ground - s.clear, duration: pass, ease: 'sine.out' }, at(s.start))
      } else {
        tl.to(rig, { [y]: ground - s.lift, duration: pass * 0.5, ease: 'sine.out' }, at(s.start))
        tl.to(rig, { [y]: ground - s.clear, duration: pass * 0.5, ease: 'sine.in' }, at(s.start + pass * 0.5))
      }
      tl.to(rig, { [y]: ground, duration: swing - pass, ease: 'sine.in' }, at(s.start + pass))
    } else if (i === 0) {
      // The trailing foot is already up from the kick-off.
      tl.to(rig, { [y]: ground, duration: swing, ease: 'power2.in' }, at(s.start))
    } else {
      tl.to(rig, { [y]: ground - s.lift, duration: swing * 0.45, ease: 'power2.out' }, at(s.start))
      tl.to(rig, { [y]: ground, duration: swing * 0.55, ease: 'power2.in' }, at(s.start + swing * 0.45))
    }

    // The four-step body moves on continuous waves, keyed below.
    if (four) return

    // Landing response: the hip sinks after contact, the torso gets knocked
    // up a little, and the head bobs a beat late.
    tl.to(rig, { hipY: R.hipY + s.dip, duration: 0.06, ease: 'power2.out' }, at(s.contact))
    tl.to(rig, { torso: s.torso + s.kick, duration: 0.08, ease: 'power2.out' }, at(s.contact))
    const next = steps[i + 1]
    if (next) {
      // Stay low between landings so the trailing foot stays in reach.
      tl.to(rig, { hipY: R.hipY + s.low, duration: next.contact - s.contact - 0.06, ease: 'sine.inOut' }, at(s.contact + 0.06))
      const gap = next.contact - s.contact
      // Through a hold the body rolls forward over the planted foot, then
      // comes up into the next landing.
      const hold = next.start - s.contact - 0.08
      if (hold > 0.05) {
        tl.to(rig, { torso: s.torso - 2, duration: hold, ease: 'sine.inOut' }, at(s.contact + 0.08))
        tl.to(rig, { torso: next.torso, duration: next.contact - next.start, ease: 'sine.inOut' }, at(next.start))
      } else {
        tl.to(rig, { torso: next.torso, duration: gap - 0.08, ease: 'sine.inOut' }, at(s.contact + 0.08))
      }
    }
    tl.to(rig, { head: s.head + s.bob, duration: 0.06, ease: 'power2.out' }, at(s.contact + 0.04))
    tl.to(rig, { head: s.head, duration: 0.1, ease: 'sine.inOut' }, at(s.contact + 0.1))
  })

  // Arms are keyed in world angles (0 hangs straight down, positive points
  // forward) and converted against the torso angle at that moment.
  const arms = (
    s: number,
    duration: number,
    torso: number,
    left: number,
    leftFore: number,
    right: number,
    rightFore: number,
    ease = 'sine.inOut',
  ) =>
    tl.to(rig, {
      upperArmLeft: left - torso,
      forearmLeft: leftFore,
      upperArmRight: right - torso,
      forearmRight: rightFore,
      duration,
      ease,
    }, at(s))
  if (four) {
    type Ease = string | ((t: number) => number)
    /** Chains tweens through [time, value, ease] keys, one after another. */
    const wave = (prop: keyof PushRig, keys: [number, number, Ease?][]) => {
      let from = 0
      for (const [time, value, ease = 'sine.inOut'] of keys) {
        tl.to(rig, { [prop]: value, duration: time - from, ease }, at(from))
        from = time
      }
    }
    /**
     * Follows an in-progress tween only as far as `cutTime`, on the same
     * curve, and stops there. Used so the drag step's climb is unchanged
     * up to the landing.
     */
    const clip = (
      fromTime: number,
      toTime: number,
      fromVal: number,
      toVal: number,
      easeName: string,
      cutTime: number,
    ): [number, number, (t: number) => number] => {
      const ease = gsap.parseEase(easeName)
      const cut = (cutTime - fromTime) / (toTime - fromTime)
      const portion = ease(cut)
      return [
        cutTime,
        fromVal + (toVal - fromVal) * portion,
        (t) => ease(t * cut) / portion,
      ]
    }
    // The drag step still climbs toward where the old stand-up was heading.
    // The keys below are cut at the landing, on that same curve.
    const oldBack = { x: X(352), y: R.backFootY }
    const oldFront = { x: X(372), y: R.frontFootY }
    const oldSpan = Math.hypot(oldFront.x - oldBack.x, oldFront.y - oldBack.y)
    const rise = Math.sqrt((THIGH_LENGTH + SHIN_LENGTH - 0.05) ** 2 - (oldSpan / 2) ** 2)
    const stood = {
      x: (oldBack.x + oldFront.x) / 2 + ((oldFront.y - oldBack.y) / oldSpan) * rise,
      y: (oldBack.y + oldFront.y) / 2 - ((oldFront.x - oldBack.x) / oldSpan) * rise,
    }
    const LAND = 2.1
    // Final stance, 40px behind the old midpoint, 22px either side of the hip.
    const back = { x: X(300), y: R.backFootY }
    const front = { x: X(344), y: R.frontFootY }

    // One sway per step: lowest just after each landing as the weight sinks
    // in, highest mid-hold. Through the drag step the torso only eases up to
    // -40, so it flows straight into the catch without rising.
    const DRAG_FROM = 1.48
    const dragEase = gsap.parseEase('sine.inOut')
    const dragTorso = (s: number) => -50 + 10 * dragEase((s - DRAG_FROM) / (LAND - DRAG_FROM))
    const dragChest = (s: number) => -5 + 1 * dragEase((s - DRAG_FROM) / (LAND - DRAG_FROM))
    wave('torso', [
      [0.36, -64], [0.62, -50], [0.88, -58], [1.18, -42], [DRAG_FROM, -50],
      [LAND, dragTorso(LAND)],
    ])
    wave('chest', [
      [0.36, -6], [0.62, -1], [0.88, -6], [1.18, -1], [DRAG_FROM, -5],
      [LAND, dragChest(LAND)],
    ])
    wave('hipY', [
      [0.36, R.hipY + 16], [0.62, R.hipY + 14], [0.88, R.hipY + 20],
      [1.18, R.hipY + 16], [1.48, R.hipY + 20],
      clip(1.48, 2.45, R.hipY + 20, stood.y, 'power1.inOut', LAND),
    ])
    // The head trails the torso by a beat: it holds back as the torso sinks,
    // then drops after it.
    wave('head', [
      [0.36, 20], [0.45, 8], [0.62, 6], [0.71, 16],
      [0.88, 16], [0.97, 4], [1.18, 2], [1.27, 12],
      [1.48, 12], [1.57, 0],
      clip(1.57, 2.45, 0, 6, 'power1.inOut', LAND),
    ])
    // Halfway between the planted feet. From the end of the drag the hip
    // eases onto that midpoint.
    const midX = (back.x + front.x) / 2
    // HipX keyed to each footfall: speed rises through the swing as the body
    // falls forward, then drops over ~80ms after contact as the landing leg
    // brakes. Each pulse is smaller than the last; the drag barely brakes.
    // Joins the break handoff and the hold midpoint without reversing.
    const swingX = (k: number) => (t: number) => (1 - k) * t * t + k * t
    const brakeX = (k: number) => (t: number) =>
      (1 - k) * (1 - (1 - t) * (1 - t)) + k * t
    {
      // break+=0.14 is stumble−0.06; first tween picks up the live hipX.
      let from = -0.06
      const keys: [number, number, (t: number) => number][] = [
        [0.3, X(138), swingX(0.38)],
        [0.38, X(149), brakeX(0.28)],
        [0.82, X(226), swingX(0.4)],
        [0.9, X(239), brakeX(0.5)],
        [1.28, X(275), swingX(0.36)],
        [1.36, X(282), brakeX(0.55)],
        [1.46, X(287), (t) => t],
        [1.78, X(314), swingX(0.65)],
        [1.9, midX, brakeX(0.85)],
      ]
      for (const [time, value, ease] of keys) {
        tl.to(
          rig,
          { hipX: value, duration: time - from, ease },
          from < 0 ? 'break+=0.14' : at(from),
        )
        from = time
      }
    }
    tl.to(rig, { hipX: midX, duration: 0.6, ease: 'sine.inOut' }, at(1.9))

    // Reach, then a loose hang through the drag. The old keys here lifted
    // one arm overhead once the torso climbed.
    arms(0, 0.2, -74, 60, 25, 30, 35, 'power2.out')
    arms(0.3, 0.08, -70, 48, 35, 22, 45, 'power2.out')
    arms(0.45, 0.3, -64, 50, 30, -25, 40)
    arms(0.9, 0.45, -58, -10, 35, 40, 30)
    // A loose forward hang, keyed against the torso and chest at each
    // moment. World angle 0 hangs down; these hold the near arm near 16°
    // and the far arm near 8° while the drag step climbs.
    const hang = (s: number, duration: number, ease = 'none') => {
      const end = s + duration
      tl.to(rig, {
        upperArmLeft: 16 - dragTorso(end) - dragChest(end),
        forearmLeft: -12,
        upperArmRight: 8 - dragTorso(end) - dragChest(end),
        forearmRight: -12,
        duration,
        ease,
      }, at(s))
    }
    hang(1.48, 0.14)
    hang(1.62, 0.14)
    hang(1.76, 0.14)
    hang(1.9, 0.15)
    hang(2.05, 0.05)

    // Winded catch. Knees soft at 20°, hip centered, hands propping the torso.
    const kneeBend = 20 * Math.PI / 180
    const legReach = Math.sqrt(
      THIGH_LENGTH ** 2 + SHIN_LENGTH ** 2 + 2 * THIGH_LENGTH * SHIN_LENGTH * Math.cos(kneeBend),
    )
    const halfSpan = (front.x - back.x) / 2
    const drop = Math.sqrt(legReach ** 2 - halfSpan ** 2)
    const catchHipY = front.y - drop
    const catchTorso = -45
    const catchChest = -8
    const catchHead = -12
    const caught: PushRig = {
      ...INITIAL_RIG,
      hipX: midX,
      hipY: catchHipY,
      torso: catchTorso,
      chest: catchChest,
      head: catchHead,
      frontFootX: front.x,
      frontFootY: front.y,
      backFootX: back.x,
      backFootY: back.y,
      grip: 0,
      drive: 0,
    }
    const pose = rigToPose(caught)
    const kneeAt = (thigh: number) => {
      const knee = limbEnd(THIGH_LENGTH, thigh)
      return { x: caught.hipX - knee.x, y: caught.hipY + knee.y }
    }
    // Bend -1 puts the elbow forward of the thigh, so the arm props from
    // the front instead of folding into the leg. The back hand sits higher
    // on its thigh: 10px above that knee is out of reach at this lean.
    const wristOnThigh = (knee: { x: number; y: number }, along: number, forward: number) => {
      const dx = caught.hipX - knee.x
      const dy = caught.hipY - knee.y
      const len = Math.hypot(dx, dy)
      const upX = dx / len
      const upY = dy / len
      let sideX = -upY
      let sideY = upX
      if (sideX < 0) {
        sideX = -sideX
        sideY = -sideY
      }
      return {
        x: knee.x + upX * along + sideX * forward,
        y: knee.y + upY * along + sideY * forward,
      }
    }
    const nearWrist = wristOnThigh(kneeAt(pose.thighLeft), 8, 6)
    const farWrist = wristOnThigh(kneeAt(pose.thighRight), 20, 12)
    const reach = (input: PushRig, target: { x: number; y: number }) => {
      const sh = rotate(shoulderLocal(input.chest).x, shoulderLocal(input.chest).y, input.torso)
      const shoulder = { x: input.hipX + input.drive - sh.x, y: input.hipY + sh.y }
      const local = rotate(
        -(target.x - shoulder.x),
        target.y - shoulder.y,
        -(input.torso + input.chest),
      )
      const arm = solveTwoBone(UPPER_ARM_LENGTH, FOREARM_LENGTH, local.x, local.y, -1)
      return { upper: arm.upper, fore: arm.lower }
    }
    const near = reach(caught, nearWrist)
    const far = reach(caught, farWrist)
    const plantHands = () => {
      const n = reach(rig, nearWrist)
      const f = reach(rig, farWrist)
      rig.upperArmLeft = n.upper
      rig.forearmLeft = n.fore
      rig.upperArmRight = f.upper
      rig.forearmRight = f.fore
    }

    tl.addLabel('catch', at(LAND))
    tl.to(rig, {
      hipY: catchHipY,
      torso: catchTorso,
      chest: catchChest,
      head: catchHead,
      duration: 0.4,
      ease: 'power2.inOut',
    }, 'catch')
    tl.to(rig, {
      upperArmLeft: near.upper,
      forearmLeft: near.fore,
      upperArmRight: far.upper,
      forearmRight: far.fore,
      duration: 0.35,
      ease: 'power2.inOut',
    }, 'catch')
    // Hands are down just before the hip finishes centering. Hold them on
    // the thighs for the rest of the settle.
    tl.to(rig, { duration: 0.05, onUpdate: plantHands }, 'catch+=0.35')
    tl.addLabel('settle', 'catch+=0.4')
    // One breath. In opens the chest a little; out returns to the catch.
    // Only the spine and head are keyed. The hands are replanted so the
    // moving shoulders don't drag them off the thighs.
    tl.to(rig, {
      torso: catchTorso + 3,
      chest: catchChest + 4,
      head: catchHead + 3,
      duration: 0.6,
      ease: 'sine.inOut',
      onUpdate: plantHands,
    }, 'settle')
    tl.to(rig, {
      torso: catchTorso,
      chest: catchChest,
      head: catchHead,
      duration: 0.9,
      ease: 'sine.inOut',
      onUpdate: plantHands,
    }, 'settle+=0.6')
    return tl
  }

  // Protective reach toward the floor, jolted by each landing.
  arms(0, 0.12, -77, 55, 20, 35, 30, 'power2.out')
  arms(0.14, 0.06, -72, 44, 30, 26, 40, 'power2.out')
  arms(0.2, 0.08, -70, 52, 22, 34, 32)
  arms(0.29, 0.06, -68, 42, 32, 24, 42, 'power2.out')
  // Split for balance, roughly against the legs, shrinking.
  arms(0.36, 0.2, -64, 45, 25, -20, 40)
  arms(0.64, 0.22, -57, -15, 35, 35, 25)
  // Out and bent, with small corrections from the lead hand.
  arms(0.86, 0.3, -52, 70, 60, -40, 50)
  arms(1.25, 0.16, -46, 95, 45, -36, 50, 'back.out(1.6)')
  arms(1.45, 0.2, -46, 68, 60, -42, 52)
  arms(1.66, 0.18, -40, 88, 50, -34, 50, 'back.out(1.4)')
  // The catch drops them loose toward the knees.
  arms(1.83, 0.32, -34, 8, 12, -4, 16, 'back.out(1.4)')

  // Catch, then one small "almost goes again" wobble before the hold.
  tl.addLabel('catch', at(1.83))
  tl.addLabel('settle', at(1.97))
  tl.to(rig, { torso: -42, hipY: R.hipY + 18, duration: 0.2, ease: 'sine.inOut' }, 'settle')
  tl.to(rig, { hipX: X(343), duration: 0.18, ease: 'sine.out' }, 'settle+=0.18')
  tl.to(rig, { frontFootY: R.frontFootY - 4, duration: 0.08, ease: 'power2.out' }, 'settle+=0.14')
  tl.to(rig, { frontFootY: R.frontFootY, duration: 0.1, ease: 'power2.in' }, 'settle+=0.22')
  tl.to(rig, { torso: -36, hipY: R.hipY + 14, head: -14, duration: 0.32, ease: 'sine.inOut' }, 'settle+=0.2')
  tl.to(rig, { hipX: X(340), duration: 0.24, ease: 'sine.inOut' }, 'settle+=0.36')

  return tl
}

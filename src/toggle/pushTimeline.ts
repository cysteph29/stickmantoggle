/**
 * Left-to-right push: settle, failed first push, recoil, wider stance,
 * second push, the break that pitches the figure forward, and the stumble
 * after it. It ends bent over mid-track, where the recovery will start.
 *
 * Offsets are stage pixels from the rest rig. +x is toward the knob and
 * +y is down. A more negative torso angle leans further into the knob.
 */
import gsap from 'gsap'
import { KNOB_RIGHT_X, SHIN_LENGTH, THIGH_LENGTH } from './layout.ts'
import {
  INITIAL_RIG,
  applyRig,
  reachArm,
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
  const tl = gsap.timeline({
    onUpdate: () => applyRig(svg, rig),
    onComplete,
  })

  /** Effort tremble around the current pose. */
  const tremble = (amount: number, duration: number) => {
    const repeats = Math.round(duration / 0.05)
    return gsap.to(rig, {
      torso: `-=${amount}`,
      hipX: `+=${amount * 0.6}`,
      head: `+=${amount * 1.5}`,
      duration: 0.05,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: repeats % 2 ? repeats : repeats + 1,
    })
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
    gripDrop: -12,
    gripSpread: 0,
    duration: 0.5,
    ease: 'power3.out',
  })
  tl.to(rig, { knobX: R.knobX + 2, duration: 0.3, ease: 'power1.out' }, 'push1+=0.2')
  tl.add(tremble(1.2, 0.55))

  // 3. Recoil: the knob wins and throws the body upright.
  tl.addLabel('recoil')
  tl.to(rig, {
    hipX: R.hipX - 12,
    hipY: R.hipY - 1,
    torso: -2,
    head: 18,
    gripDrop: -2,
    duration: 0.3,
    ease: 'back.out(2.5)',
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
    head: 50,
    gripDrop: -8,
    duration: 0.5,
    ease: 'power3.out',
  })
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

  // One decaying glide carries the hip from the break to the catch, so its
  // speed only ever falls. It takes over mid-break, where the break's hip is
  // still moving at about the same speed.
  const four = variant === 'four'
  tl.to(rig, { hipX: X(340), duration: four ? 2.4 : 2, ease: 'power1.out' }, 'break+=0.14')
  if (!four) {
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
  // Long, heavy lurches under the still-surging body. Each landing is further
  // from the last (0.30, 0.52, 0.60, 0.68s) and each lift waits longer. The
  // two middle strides are the biggest, so the hip stays deep through them;
  // the last step only drags the front foot into place.
  const fourSteps: Step[] = [
    { foot: 'back', start: 0, contact: 0.3, toX: X(184), lift: 22, dip: 14, low: 18, torso: -70, kick: 0, head: 16, bob: 3, ease: 'power2.out' },
    { foot: 'front', start: 0.36, contact: 0.82, toX: X(276), lift: 24, dip: 20, low: 17, torso: -60, kick: 0, head: 10, bob: 3, ease: 'power1.out' },
    { foot: 'back', start: 0.9, contact: 1.42, toX: X(352), lift: 22, dip: 20, low: 16, torso: -46, kick: 0, head: 4, bob: 2.5, ease: 'power1.inOut' },
    // The drag step is where control returns: the torso climbs toward upright.
    { foot: 'front', start: 1.7, contact: 2.1, toX: X(372), lift: 4, dip: 14, low: 14, torso: -20, kick: 0, head: 2, bob: 1.5, ease: 'sine.inOut' },
  ]
  const steps = four ? fourSteps : sixSteps

  steps.forEach((s, i) => {
    const x = s.foot === 'front' ? 'frontFootX' : 'backFootX'
    const y = s.foot === 'front' ? 'frontFootY' : 'backFootY'
    const ground = s.foot === 'front' ? R.frontFootY : R.backFootY
    const swing = s.contact - s.start
    tl.to(rig, { [x]: s.toX, duration: swing, ease: s.ease }, at(s.start))
    if (i === 0) {
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
    /** Chains tweens through [time, value, ease] keys, one after another. */
    const wave = (prop: keyof PushRig, keys: [number, number, string?][]) => {
      let from = 0
      for (const [time, value, ease = 'sine.inOut'] of keys) {
        tl.to(rig, { [prop]: value, duration: time - from, ease }, at(from))
        from = time
      }
    }
    // Standing tall puts the hip where both legs are just short of straight.
    const back = { x: X(352), y: R.backFootY }
    const front = { x: X(372), y: R.frontFootY }
    const span = Math.hypot(front.x - back.x, front.y - back.y)
    const rise = Math.sqrt((THIGH_LENGTH + SHIN_LENGTH - 0.05) ** 2 - (span / 2) ** 2)
    const stand = {
      x: (back.x + front.x) / 2 + ((front.y - back.y) / span) * rise,
      y: (back.y + front.y) / 2 - ((front.x - back.x) / span) * rise,
    }

    // One sway per step: lowest just after each landing as the weight sinks
    // in, highest mid-hold, riding a steady climb toward upright. The spine
    // rounds into each fall and straightens as the landing catches it. The
    // last climb runs straight through to a slight arch, then eases back.
    wave('torso', [
      [0.36, -64], [0.62, -50], [0.88, -58], [1.18, -42], [1.48, -50],
      [2.45, 3, 'power1.inOut'], [2.7, -2],
    ])
    wave('chest', [
      [0.36, -6], [0.62, -1], [0.88, -6], [1.18, -1], [1.48, -5],
      [2.45, 6, 'power1.inOut'], [2.7, 0],
    ])
    wave('hipY', [
      [0.36, R.hipY + 16], [0.62, R.hipY + 14], [0.88, R.hipY + 20],
      [1.18, R.hipY + 16], [1.48, R.hipY + 20],
      [2.45, stand.y, 'power1.inOut'],
    ])
    // The head trails the torso by a beat: it holds back as the torso sinks,
    // then drops after it, and lags again on the way up.
    wave('head', [
      [0.36, 20], [0.45, 8], [0.62, 6], [0.71, 16],
      [0.88, 16], [0.97, 4], [1.18, 2], [1.27, 12],
      [1.48, 12], [1.57, 0],
      [2.45, 6, 'power1.inOut'], [2.7, 2],
    ])
    tl.to(rig, { hipX: stand.x, duration: 0.6, ease: 'sine.inOut' }, at(1.9))

    // Reach, then slow balancing against the legs, then the hands go to the
    // hips once the body is upright.
    arms(0, 0.2, -74, 60, 25, 30, 35, 'power2.out')
    arms(0.3, 0.08, -70, 48, 35, 22, 45, 'power2.out')
    arms(0.45, 0.3, -64, 50, 30, -25, 40)
    arms(0.9, 0.45, -58, -10, 35, 40, 30)
    arms(1.42, 0.1, -46, 60, 55, -35, 50, 'power2.out')
    arms(1.55, 0.45, -40, 75, 55, -40, 50)
    arms(2.1, 0.3, 0, 8, 15, -4, 18, 'power2.out')

    // Made it. Hands to the hips, then a deep breath in and a long breath out.
    tl.addLabel('catch', at(2.1))
    tl.addLabel('settle', at(2.5))
    const upright: PushRig = {
      ...rig,
      hipX: stand.x,
      hipY: stand.y,
      torso: -2,
      chest: 0,
    }
    const near = reachArm(upright, 'near', { x: upright.hipX + 2, y: upright.hipY - 8 })
    const far = reachArm(upright, 'far', { x: upright.hipX - 2, y: upright.hipY - 8 })
    tl.to(rig, {
      upperArmLeft: near.upper,
      forearmLeft: near.fore,
      upperArmRight: far.upper,
      forearmRight: far.fore,
      duration: 0.4,
      ease: 'power2.inOut',
    }, 'settle')
    // The legs are near straight, so the breath lives in the spine and head.
    tl.to(rig, { torso: 2, chest: 6, head: 8, duration: 0.6, ease: 'sine.inOut' }, 'settle+=0.4')
    tl.to(rig, { torso: -4, chest: -10, head: -2, duration: 0.9, ease: 'sine.inOut' }, 'settle+=1.0')
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

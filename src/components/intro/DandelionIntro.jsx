import { useEffect, useRef, useState } from 'react'

/**
 * Dandelion arrival sequence.
 *
 * A line-art dandelion holds still, a gust sweeps through, the seeds release and
 * drift away, and `onComplete` fires so the caller can raise the headline into
 * the space the flower vacated.
 *
 * Timings and seed physics are tuned — change the constants below rather than
 * the logic.
 *
 * Uses the Web Animations API rather than motion/react: the sequence is
 * imperative and one-shot, which WAAPI expresses more directly.
 *
 * This component assumes it is only mounted when it should actually animate.
 * The reduced-motion and play-once checks live in `Hero`, so that under reduced
 * motion the ~290 SVG nodes below are never created at all.
 */

/** Wind travel direction, degrees. -25 = rightward and slightly up (SVG y grows downward). */
const WIND_DEG = -25
const SEED_COUNT = 42
/** Seeds that stubbornly stay on the stem. Keeps it from looking machine-perfect. */
const STAY_COUNT = 3

/** Centre of the seed head, in viewBox units. */
const CX = 150
const CY = 130

/** Timeline in ms, measured from the moment fonts are ready. */
const T = {
  windStart: 260,
  scatterStart: 420,
  fadeStart: 1750,
  fadeDuration: 750,
  /** Headline starts rising here, while the last seeds are still in the air. */
  complete: 1800,
}

/** If `document.fonts.ready` never settles, start anyway. */
const FONT_TIMEOUT = 1200

const rand = (min, max) => min + Math.random() * (max - min)
const n = (v) => Number(v.toFixed(1))

/**
 * Builds every path once. Randomised per mount so no two visits are identical,
 * then held in state so it is stable across re-renders.
 */
function buildGeometry() {
  const windRad = (WIND_DEG * Math.PI) / 180
  const wind = { x: Math.cos(windRad), y: Math.sin(windRad) }
  /** Perpendicular to the wind, used to give each seed a little sideways wobble. */
  const perp = { x: -wind.y, y: wind.x }

  const stayIndices = new Set()
  while (stayIndices.size < STAY_COUNT) {
    stayIndices.add(Math.floor(Math.random() * SEED_COUNT))
  }

  const seeds = []
  for (let i = 0; i < SEED_COUNT; i++) {
    const angle = (360 / SEED_COUNT) * i + rand(-4.5, 4.5)
    const rad = (angle * Math.PI) / 180
    const outerR = rand(55, 77)
    const innerR = 13

    const tipX = CX + Math.cos(rad) * outerR
    const tipY = CY + Math.sin(rad) * outerR
    const baseX = CX + Math.cos(rad) * innerR
    const baseY = CY + Math.sin(rad) * innerR
    const midX = (baseX + tipX) / 2 + rand(-2.5, 2.5)
    const midY = (baseY + tipY) / 2 + rand(-2.5, 2.5)

    const tuftCount = Math.floor(rand(5, 8))
    const tufts = []
    for (let j = 0; j < tuftCount; j++) {
      const a = rad + (j / (tuftCount - 1) - 0.5) * 2.2 + rand(-0.05, 0.05)
      const len = rand(5, 9)
      tufts.push({
        x1: n(tipX),
        y1: n(tipY),
        x2: n(tipX + Math.cos(a) * len),
        y2: n(tipY + Math.sin(a) * len),
      })
    }

    /**
     * -1..1. Positive means this seed sits on the side the wind is heading toward,
     * so the head peels away in the direction of travel: leading edge first,
     * upwind side last.
     */
    const alignment = Math.cos(rad) * wind.x + Math.sin(rad) * wind.y
    const releaseOrder = (1 - alignment) / 2 // 0 = goes first, 1 = goes last

    const distance = rand(230, 400)
    const wobble = rand(8, 20)

    seeds.push({
      stays: stayIndices.has(i),
      stalk: `M${n(baseX)},${n(baseY)} Q${n(midX)},${n(midY)} ${n(tipX)},${n(tipY)}`,
      strokeWidth: Number(rand(0.7, 1).toFixed(2)),
      tufts,
      delay: 300 + releaseOrder * 780 + rand(0, 120),
      duration: rand(1000, 1500),
      rotation: rand(-30, 60),
      midX: n(wind.x * distance * 0.42 + perp.x * rand(-wobble / 2, wobble / 2)),
      midY: n(wind.y * distance * 0.42 + perp.y * rand(-wobble / 2, wobble / 2)),
      endX: n(wind.x * distance),
      endY: n(wind.y * distance),
      settleX: n(rand(-0.8, 0.8)),
      settleY: n(rand(0, 1)),
    })
  }

  const windLines = []
  for (let i = 0; i < 4; i++) {
    const sx = rand(-10, 20)
    const sy = rand(30, 260)
    const len = rand(65, 120)
    const ex = sx - wind.x * len
    const ey = sy - wind.y * len
    windLines.push({
      d: `M${n(ex)},${n(ey)} L${n(sx)},${n(sy)}`,
      length: Math.hypot(sx - ex, sy - ey),
      delay: i * 100,
      duration: rand(760, 960),
    })
  }

  return { seeds, windLines }
}

/**
 * @param {object} props
 * @param {() => void} props.onComplete Fired when the headline should start rising.
 * @param {string} [props.className] Positioning classes from the caller.
 * @returns {JSX.Element}
 */
export function DandelionIntro({ onComplete, className }) {
  const [geometry] = useState(buildGeometry)
  const rootRef = useRef(null)
  const seedRefs = useRef([])
  const windRefs = useRef([])
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    let cancelled = false
    /* `document.fonts.ready` and the timeout below are both armed, and fonts
       normally resolve first. Without this flag whichever loses would still run
       the whole sequence a second time — duplicate animations, a duplicate
       onComplete, duplicate timers. */
    let hasRun = false
    const animations = []
    const timers = []

    const run = () => {
      if (cancelled || hasRun) return
      hasRun = true

      geometry.windLines.forEach((line, i) => {
        const el = windRefs.current[i]
        if (!el) return
        animations.push(
          el.animate(
            [
              { strokeDashoffset: line.length, opacity: 0 },
              { strokeDashoffset: 0, opacity: 0.6, offset: 0.5 },
              { strokeDashoffset: -line.length * 0.3, opacity: 0 },
            ],
            {
              duration: line.duration,
              delay: T.windStart + line.delay,
              easing: 'ease-in-out',
              fill: 'forwards',
            },
          ),
        )
      })

      geometry.seeds.forEach((seed, i) => {
        const el = seedRefs.current[i]
        if (!el) return

        if (seed.stays) {
          animations.push(
            el.animate(
              [
                { transform: 'translate(0px, 0px)' },
                { transform: `translate(${seed.settleX}px, ${seed.settleY}px)` },
              ],
              {
                duration: 2500,
                delay: T.scatterStart + rand(40, 360),
                easing: 'ease-out',
                fill: 'forwards',
              },
            ),
          )
          return
        }

        animations.push(
          el.animate(
            [
              { transform: 'translate(0px, 0px) rotate(0deg)', opacity: 1, offset: 0 },
              {
                transform: `translate(${seed.midX}px, ${seed.midY}px) rotate(${(seed.rotation * 0.5).toFixed(0)}deg)`,
                opacity: 1,
                offset: 0.5,
              },
              {
                transform: `translate(${seed.endX}px, ${seed.endY}px) rotate(${seed.rotation.toFixed(0)}deg)`,
                opacity: 0,
                offset: 1,
              },
            ],
            {
              duration: seed.duration,
              delay: T.scatterStart + seed.delay,
              easing: 'cubic-bezier(0.5, 0, 0.85, 1)',
              fill: 'forwards',
            },
          ),
        )
      })

      if (rootRef.current) {
        animations.push(
          rootRef.current.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: T.fadeDuration,
            delay: T.fadeStart,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            fill: 'forwards',
          }),
        )
      }

      timers.push(
        window.setTimeout(() => {
          if (!cancelled) onCompleteRef.current?.()
        }, T.complete),
      )
    }

    /**
     * Wait for fonts before starting. The caller sizes the shared box to the
     * headline's rendered width, so starting during the fallback font would
     * centre the flower on the wrong width and make it jump when the real
     * face loads.
     */
    if (document.fonts?.ready) {
      document.fonts.ready.then(run)
      timers.push(window.setTimeout(run, FONT_TIMEOUT))
    } else {
      run()
    }

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      animations.forEach((animation) => animation.cancel())
    }
  }, [geometry])

  return (
    <div ref={rootRef} className={className} aria-hidden="true">
      <svg
        viewBox="0 0 300 320"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          color: 'var(--text-primary)',
        }}
      >
        <g>
          {geometry.windLines.map((line, i) => (
            <path
              key={i}
              ref={(el) => {
                windRefs.current[i] = el
              }}
              d={line.d}
              stroke="var(--color-signal)"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
              style={{
                strokeDasharray: line.length,
                strokeDashoffset: line.length,
                opacity: 0,
              }}
            />
          ))}
        </g>

        <path
          d="M150,300 C138,255 168,195 150,130"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M150,222 C166,219 180,202 174,187 C159,193 148,209 150,222 Z"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        <circle cx="150" cy="130" r="4.5" stroke="currentColor" strokeWidth="1" fill="none" />

        {geometry.seeds.map((seed, i) => (
          <g
            key={i}
            ref={(el) => {
              seedRefs.current[i] = el
            }}
          >
            <path
              d={seed.stalk}
              stroke="currentColor"
              strokeWidth={seed.strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
            {seed.tufts.map((tuft, j) => (
              <line
                key={j}
                x1={tuft.x1}
                y1={tuft.y1}
                x2={tuft.x2}
                y2={tuft.y2}
                stroke="currentColor"
                strokeWidth="0.6"
                strokeLinecap="round"
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  )
}

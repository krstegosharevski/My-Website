import { useEffect, useRef } from 'react'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

/* ---------------------------------------------------------------------------
   §3.6. Sitting by a lake before sunrise: calm, almost still, small movement,
   and now and then a bird crosses.

   The tuning rule from the plan: if it reads as an animation, the amplitude is
   too high. Cut amplitude and opacity before touching the frame rate.
   --------------------------------------------------------------------------- */

const FPS = 30
const FRAME_MS = 1000 / FPS
const MAX_DPR = 2
const RESIZE_DEBOUNCE = 150

/** Horizontal sample spacing, in CSS pixels. Coarse enough to be cheap. */
const STEP = 10

/**
 * Where the four bands sit, as a fraction of the canvas height.
 *
 * `lake` fills most of the frame — it is the About page background. `horizon`
 * keeps the water pressed into the bottom edge, so it can sit under the home
 * hero without competing with the headline.
 */
const LAYOUTS = {
  lake: { top: 0.44, spread: 0.56 },
  horizon: { top: 0.62, spread: 0.38 },
}

/**
 * Four bands, each the sum of three sines with different wavelengths, periods
 * and phases so the crests never line up into a repeating pattern.
 *
 * `amp` is the band's total amplitude in CSS pixels, split across its three
 * sines by `WEIGHTS`. The range across the four bands is 6–14px, per §3.6.
 * Periods are 22–45s, so a full cycle is slow enough to be missed.
 *
 * Values are fixed rather than random: the effect re-runs when props change,
 * and randomising here would make the water jump at that moment.
 */
const BANDS = [
  { amp: 6, wavelengths: [0.9, 0.45, 0.28], periods: [34, 27, 41], phases: [0.0, 1.7, 3.4] },
  { amp: 8, wavelengths: [1.1, 0.5, 0.33], periods: [29, 38, 23], phases: [0.8, 2.6, 4.9] },
  { amp: 11, wavelengths: [1.3, 0.6, 0.37], periods: [26, 33, 45], phases: [1.9, 3.9, 0.6] },
  { amp: 14, wavelengths: [1.6, 0.72, 0.44], periods: [22, 36, 30], phases: [3.1, 1.2, 5.5] },
]

const WEIGHTS = [0.5, 0.3, 0.2]

/** Ripple: expands and fades over 4s, somewhere new every 25–60s. */
const RIPPLE_DURATION = 4
const RIPPLE_MIN_GAP = 25
const RIPPLE_MAX_GAP = 60
const RIPPLE_MAX_RADIUS = 110

/** Bird: crosses the upper area in ~18s, every 60–120s, at 0.12 opacity. */
const BIRD_DURATION = 18
const BIRD_MIN_GAP = 60
const BIRD_MAX_GAP = 120
const BIRD_OPACITY = 0.12

/**
 * @param {number} min
 * @param {number} max
 * @returns {number} A value in [min, max). Event gaps are random inside a
 *   range so nothing settles into a fixed loop.
 */
function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

/**
 * Pull the water tint out of CSS so the canvas follows the theme instead of
 * hard-coding a colour.
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {{ rgb: string, alpha: number, inkRgb: string }}
 */
function readPalette(canvas) {
  const styles = getComputedStyle(canvas)
  const rgb = styles.getPropertyValue('--water-rgb').trim() || '31, 94, 255'
  const alpha = Number.parseFloat(styles.getPropertyValue('--water-alpha')) || 0.06

  /* The canvas carries `text-primary`, so its computed `color` is already the
     theme's ink as an rgb() triple — cheaper than parsing a hex custom
     property, and it tracks the theme for free. */
  const match = styles.color.match(/-?\d+(\.\d+)?/g)
  const inkRgb = match ? match.slice(0, 3).join(', ') : '20, 22, 26'

  return { rgb, alpha, inkRgb }
}

/**
 * Vertical offset of a band's surface at a given x.
 *
 * @param {typeof BANDS[number]} band
 * @param {number} x Position in CSS pixels.
 * @param {number} width Canvas width in CSS pixels.
 * @param {number} time Elapsed seconds.
 * @returns {number} Offset in CSS pixels.
 */
function surfaceOffset(band, x, width, time) {
  let offset = 0
  for (let i = 0; i < 3; i += 1) {
    const wavelength = band.wavelengths[i] * width
    const angle =
      (x / wavelength) * Math.PI * 2 +
      (time / band.periods[i]) * Math.PI * 2 +
      band.phases[i]
    offset += Math.sin(angle) * band.amp * WEIGHTS[i]
  }
  return offset
}

/**
 * A bird, drawn as two wing strokes whose curvature flaps.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} scale
 * @param {number} flap 0–1 through one wingbeat.
 */
function drawBird(ctx, x, y, scale, flap) {
  const span = 9 * scale
  const lift = Math.sin(flap * Math.PI * 2) * 4 * scale

  ctx.beginPath()
  ctx.moveTo(x - span, y)
  ctx.quadraticCurveTo(x - span * 0.5, y - lift, x, y)
  ctx.quadraticCurveTo(x + span * 0.5, y - lift, x + span, y)
  ctx.stroke()
}

/**
 * The signature ambient element: canvas 2D, four sine-summed bands, an
 * occasional ripple, and an occasional bird.
 *
 * It is decoration — `aria-hidden`, `pointer-events: none`, and always behind
 * its siblings. Text sits still on top of it.
 *
 * Performance, per §3.6: the loop is capped at 30fps, paused by an
 * `IntersectionObserver` when the canvas scrolls out of view and by
 * `visibilitychange` when the tab is hidden, device pixel ratio is capped at 2,
 * and resizes are debounced. Under reduced motion it draws a single frame and
 * never starts a loop.
 *
 * @param {object} props
 * @param {'lake' | 'horizon'} [props.variant='lake'] `lake` fills the frame;
 *   `horizon` keeps the water at the bottom edge.
 * @param {number} [props.intensity=1] 0–1, scaling both amplitude and opacity.
 * @param {number} [props.timeScale=1] Multiplies elapsed time. Only for the
 *   styleguide, where 20 makes the ripple and bird observable without waiting.
 * @param {string} [props.className] Extra classes for the canvas.
 * @returns {JSX.Element}
 */
export function WaterField({
  variant = 'lake',
  intensity = 1,
  timeScale = 1,
  className,
}) {
  const reducedMotion = useReducedMotion()
  const canvasRef = useRef(/** @type {HTMLCanvasElement | null} */ (null))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const layout = LAYOUTS[variety(variant)]
    const strength = Math.min(Math.max(intensity, 0), 1)

    let width = 0
    let height = 0
    let palette = readPalette(canvas)

    /** Seconds of water time. Advances by real time × timeScale. */
    let elapsed = 0
    let lastFrame = 0

    /** @type {{ x: number, y: number, born: number } | null} */
    let ripple = null
    let nextRippleAt = randomBetween(RIPPLE_MIN_GAP, RIPPLE_MAX_GAP)

    /** @type {{ born: number, y: number, direction: 1 | -1, scale: number } | null} */
    let bird = null
    let nextBirdAt = randomBetween(BIRD_MIN_GAP, BIRD_MAX_GAP)

    let frame = 0
    let visible = true
    let running = false

    function resize() {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)

      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      palette = readPalette(canvas)
    }

    function draw() {
      ctx.clearRect(0, 0, width, height)
      if (width === 0 || height === 0) return

      /* Bands are filled down to the bottom edge, so they stack. The overlap is
         what makes the water read as denser near the viewer and lighter towards
         the horizon, without shading each band separately. */
      for (let b = 0; b < BANDS.length; b += 1) {
        const band = BANDS[b]
        const baseY =
          height * (layout.top + layout.spread * ((b + 0.5) / BANDS.length))

        ctx.beginPath()
        ctx.moveTo(0, baseY + surfaceOffset(band, 0, width, elapsed) * strength)
        for (let x = STEP; x <= width; x += STEP) {
          ctx.lineTo(x, baseY + surfaceOffset(band, x, width, elapsed) * strength)
        }
        ctx.lineTo(width, height)
        ctx.lineTo(0, height)
        ctx.closePath()

        const bandAlpha = palette.alpha * strength * (0.72 + b * 0.12)
        ctx.fillStyle = `rgba(${palette.rgb}, ${bandAlpha})`
        ctx.fill()
      }

      if (ripple) {
        const age = (elapsed - ripple.born) / RIPPLE_DURATION
        if (age >= 1) {
          ripple = null
        } else {
          /* Expands as it fades. Squashed vertically so the ring reads as lying
             on the water plane rather than facing the viewer. */
          const radius = RIPPLE_MAX_RADIUS * age
          ctx.beginPath()
          ctx.ellipse(ripple.x, ripple.y, radius, radius * 0.26, 0, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${palette.rgb}, ${
            palette.alpha * strength * 1.6 * (1 - age)
          })`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      if (bird) {
        const age = (elapsed - bird.born) / BIRD_DURATION
        if (age >= 1) {
          bird = null
        } else {
          const travel = bird.direction === 1 ? age : 1 - age
          const x = -40 + travel * (width + 80)
          /* A slow sag across the crossing, so the path is not a ruled line. */
          const y = bird.y + Math.sin(age * Math.PI) * -10

          ctx.strokeStyle = `rgba(${palette.inkRgb}, ${BIRD_OPACITY * strength})`
          ctx.lineWidth = 1.2
          ctx.lineCap = 'round'
          drawBird(ctx, x, y, bird.scale, age * 26)
        }
      }
    }

    function schedule() {
      if (elapsed >= nextRippleAt) {
        const band = BANDS[Math.floor(Math.random() * BANDS.length)]
        const bandIndex = BANDS.indexOf(band)
        const baseY =
          height *
          (layout.top + layout.spread * ((bandIndex + 0.5) / BANDS.length))
        ripple = {
          x: randomBetween(width * 0.15, width * 0.85),
          y: baseY,
          born: elapsed,
        }
        nextRippleAt = elapsed + randomBetween(RIPPLE_MIN_GAP, RIPPLE_MAX_GAP)
      }

      if (elapsed >= nextBirdAt) {
        bird = {
          born: elapsed,
          y: height * randomBetween(0.12, 0.3),
          direction: Math.random() < 0.5 ? 1 : -1,
          scale: randomBetween(0.8, 1.25),
        }
        nextBirdAt = elapsed + randomBetween(BIRD_MIN_GAP, BIRD_MAX_GAP)
      }
    }

    /**
     * @param {number} now High-resolution timestamp from rAF.
     */
    function tick(now) {
      frame = requestAnimationFrame(tick)

      const delta = now - lastFrame
      if (delta < FRAME_MS) return
      lastFrame = now

      /* Cap the step so returning to a backgrounded tab does not fast-forward
         the water — and does not fire a burst of queued ripples. */
      elapsed += Math.min(delta, 250) * 0.001 * timeScale

      schedule()
      draw()
    }

    function start() {
      if (running) return
      running = true
      lastFrame = performance.now() - FRAME_MS
      frame = requestAnimationFrame(tick)
    }

    function stop() {
      running = false
      cancelAnimationFrame(frame)
    }

    function syncRunning() {
      if (visible && !document.hidden) start()
      else stop()
    }

    resize()
    draw()

    /* Observing the canvas rather than the window catches the cases the window
       misses: a sidebar opening, content reflowing, the resizable box in the
       styleguide. */
    let resizeTimer
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        resize()
        draw()
      }, RESIZE_DEBOUNCE)
    })
    resizeObserver.observe(canvas)

    /* A theme swap changes --water-alpha and the ink the bird is drawn in. */
    const themeObserver = new MutationObserver(() => {
      palette = readPalette(canvas)
      if (reducedMotion) draw()
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    /* One frame and nothing else — but it still has to survive a resize and a
       theme change, so the observers above stay live. */
    if (reducedMotion) {
      return () => {
        clearTimeout(resizeTimer)
        resizeObserver.disconnect()
        themeObserver.disconnect()
      }
    }

    const inViewObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        syncRunning()
      },
      { threshold: 0 },
    )
    inViewObserver.observe(canvas)

    document.addEventListener('visibilitychange', syncRunning)
    syncRunning()

    return () => {
      stop()
      clearTimeout(resizeTimer)
      resizeObserver.disconnect()
      themeObserver.disconnect()
      inViewObserver.disconnect()
      document.removeEventListener('visibilitychange', syncRunning)
    }
  }, [variant, intensity, timeScale, reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none block h-full w-full text-primary',
        className,
      )}
    />
  )
}

/**
 * Guard an unknown variant down to a known layout rather than crashing on
 * `undefined`.
 *
 * @param {string} value
 * @returns {'lake' | 'horizon'}
 */
function variety(value) {
  return value === 'horizon' ? 'horizon' : 'lake'
}

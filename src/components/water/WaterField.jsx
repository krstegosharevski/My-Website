import { useEffect, useRef } from 'react'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

/* ---------------------------------------------------------------------------
   §3.6. Sitting by a lake before sunrise: calm, small movement, and now and
   then a bird crosses or a fish jumps.

   History, because it took three passes to get right: the original spec's
   "if it reads as an animation, the amplitude is too high" produced water
   nobody could see move. The first fix raised amplitude and opacity — still
   invisible, because the actual cause was never amplitude. Each band is a
   *filled* shape stacked on the next, so what should read as "a wave" is the
   boundary between two nearly identical translucent fills — at the alpha
   values here, neighbouring bands differ by well under 1% opacity, a ~1-in-255
   colour step. No distance travelled makes an invisible edge visible.

   The actual fix, below: stroke a visible line along each band's surface
   (`CREST_ALPHA_MULTIPLIER`) instead of relying on the fill boundary, speed
   the surface up, and replace the abstract "ripple is the fish" idea with an
   actual jumping fish. Amplitude and the fill alpha stay close to the
   original spec — they were never the problem.
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
 * sines by `WEIGHTS` — 10–24px, close to §3.6's original 6–14px. Periods are
 * roughly half the original 22–45s, chosen per band so every band moves at a
 * similar few-px/sec speed rather than the nearest band whipping past the
 * farthest. Speed, not amplitude, is what makes the crest line (see `draw`)
 * read as moving water instead of a static line.
 *
 * Values are fixed rather than random: the effect re-runs when props change,
 * and randomising here would make the water jump at that moment.
 */
const BANDS = [
  { amp: 10, wavelengths: [0.9, 0.45, 0.28], periods: [13, 10, 17], phases: [0.0, 1.7, 3.4] },
  { amp: 14, wavelengths: [1.1, 0.5, 0.33], periods: [17, 13, 21], phases: [0.8, 2.6, 4.9] },
  { amp: 19, wavelengths: [1.3, 0.6, 0.37], periods: [22, 17, 27], phases: [1.9, 3.9, 0.6] },
  { amp: 24, wavelengths: [1.6, 0.72, 0.44], periods: [27, 21, 33], phases: [3.1, 1.2, 5.5] },
]

const WEIGHTS = [0.5, 0.3, 0.2]

/**
 * The crest line: a stroke along each band's surface, on top of its fill.
 * This is the actual fix for visibility — see the file-level comment. The
 * fill alpha alone was never enough contrast to read as motion; a thin line
 * at several times that alpha is.
 */
const CREST_ALPHA_MULTIPLIER = 6
const CREST_LINE_WIDTH = 1.25

/** Ambient ripple: expands and fades, somewhere new at a random interval. A
 *  fish's launch and landing (below) each add one of these too, so this array
 *  ends up holding both ambient ripples and splash marks — same look, either
 *  cause. */
const RIPPLE_DURATION = 4.5
const RIPPLE_MIN_GAP = 16
const RIPPLE_MAX_GAP = 36
const RIPPLE_MAX_RADIUS = 170

/** Bird: crosses the upper area in ~18s, every 60–120s. */
const BIRD_DURATION = 18
const BIRD_MIN_GAP = 60
const BIRD_MAX_GAP = 120
/** Was 0.12 — same invisibility bug as the bands, fixed the same way: this is
 *  a contrast constant, not a frequency one, so only this changed. */
const BIRD_OPACITY = 0.32

/**
 * A fish, jumping clear of the surface and back in. Parabolic arc: linear in
 * x, `y = surfaceY − 4h·t(1−t)` in t ∈ [0,1] — the standard normalised
 * projectile parabola, peaking at h above the surface at t=0.5.
 */
const FISH_DURATION_MIN = 1.6
const FISH_DURATION_MAX = 2.2
const FISH_ARC_HEIGHT_MIN = 40
const FISH_ARC_HEIGHT_MAX = 70
const FISH_ARC_DISTANCE_MIN = 50
const FISH_ARC_DISTANCE_MAX = 90
const FISH_MIN_GAP = 7
const FISH_MAX_GAP = 15
/** The very first fish on the `horizon` variant uses a shorter, tighter gap
 *  than the steady-state range above — long enough to clear the dandelion
 *  intro (~2.5s, see Hero.jsx), short enough that the water feels alive
 *  quickly rather than possibly waiting the steady-state range's full 15s. */
const FISH_FIRST_MIN_GAP = 3
const FISH_FIRST_MAX_GAP = 6
const FISH_OPACITY_MULT = 0.5

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
 * A fish silhouette — a lens-shaped body plus a triangular tail fin, nose at
 * local +x. Facing left is done by mirroring (`ctx.scale(-1, 1)`) rather than
 * rotating past vertical: a rotation-only approach flips the shape upside
 * down for half the compass, since the body is drawn top/bottom-asymmetric
 * only implicitly (via the fill) but the tail is not. Mirror first keeps "up"
 * always up; `pitch` (bounded well short of ±90°) then tilts the nose along
 * the arc without ever crossing into upside down.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} pitch Radians. Negative noses up, positive noses down.
 * @param {1 | -1} facing
 * @param {number} scale
 */
function drawFish(ctx, x, y, pitch, facing, scale) {
  const L = 10 * scale

  ctx.save()
  ctx.translate(x, y)
  if (facing === -1) ctx.scale(-1, 1)
  ctx.rotate(pitch)

  ctx.beginPath()
  ctx.moveTo(L, 0)
  ctx.quadraticCurveTo(L * 0.3, -L * 0.45, -L * 0.5, 0)
  ctx.quadraticCurveTo(L * 0.3, L * 0.45, L, 0)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(-L * 0.5, 0)
  ctx.lineTo(-L * 0.95, -L * 0.35)
  ctx.lineTo(-L * 0.95, L * 0.35)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

/**
 * The signature ambient element: canvas 2D, four sine-summed bands with a
 * visible crest line, an occasional ripple, an occasional bird, and an
 * occasional jumping fish.
 *
 * It is decoration — `aria-hidden`, `pointer-events: none`, and always behind
 * its siblings. Text sits still on top of it.
 *
 * Performance, per §3.6: the loop is capped at 30fps, paused by an
 * `IntersectionObserver` when the canvas scrolls out of view and by
 * `visibilitychange` when the tab is hidden, device pixel ratio is capped at 2,
 * and resizes are debounced. Under reduced motion it draws a single frame and
 * never starts a loop — that one frame has bands and their crest lines, but no
 * ripple, bird or fish, since those only ever get scheduled from inside the
 * loop that reduced motion skips.
 *
 * @param {object} props
 * @param {'lake' | 'horizon'} [props.variant='lake'] `lake` fills the frame;
 *   `horizon` keeps the water at the bottom edge.
 * @param {number} [props.intensity=1] 0–1, scaling amplitude, fill opacity,
 *   crest and event opacity together.
 * @param {number} [props.timeScale=1] Multiplies elapsed time. Only for the
 *   styleguide, where 20 makes ripples, birds and fish observable without
 *   waiting out their real intervals.
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

    const resolvedVariant = variety(variant)
    const layout = LAYOUTS[resolvedVariant]
    const strength = Math.min(Math.max(intensity, 0), 1)

    let width = 0
    let height = 0
    let palette = readPalette(canvas)

    /** Seconds of water time. Advances by real time × timeScale. */
    let elapsed = 0
    let lastFrame = 0

    /** @type {Array<{ x: number, y: number, born: number }>} */
    let ripples = []
    let nextRippleAt = randomBetween(RIPPLE_MIN_GAP, RIPPLE_MAX_GAP)

    /** @type {{ born: number, y: number, direction: 1 | -1, scale: number } | null} */
    let bird = null
    let nextBirdAt = randomBetween(BIRD_MIN_GAP, BIRD_MAX_GAP)

    /** @type {Array<{ born: number, duration: number, x0: number, dx: number, baseY: number, h: number, scale: number }>} */
    let fish = []
    /* Horizon (the hero) gets a short first delay so the water feels alive
       quickly without landing on top of the dandelion intro; lake (About) has
       no such neighbour and just uses the steady-state range. */
    let nextFishAt =
      resolvedVariant === 'horizon'
        ? randomBetween(FISH_FIRST_MIN_GAP, FISH_FIRST_MAX_GAP)
        : randomBetween(FISH_MIN_GAP, FISH_MAX_GAP)

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
         the horizon, without shading each band separately. The crest line reuses
         the same sampled points as an open, unfilled stroke on top — see the
         file-level comment for why the fill alone was never enough contrast. */
      for (let b = 0; b < BANDS.length; b += 1) {
        const band = BANDS[b]
        const baseY =
          height * (layout.top + layout.spread * ((b + 0.5) / BANDS.length))

        const points = []
        for (let x = 0; x <= width; x += STEP) {
          points.push([x, baseY + surfaceOffset(band, x, width, elapsed) * strength])
        }
        if (points[points.length - 1][0] !== width) {
          points.push([width, baseY + surfaceOffset(band, width, width, elapsed) * strength])
        }

        ctx.beginPath()
        ctx.moveTo(points[0][0], points[0][1])
        for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1])
        ctx.lineTo(width, height)
        ctx.lineTo(0, height)
        ctx.closePath()

        const bandAlpha = palette.alpha * strength * (0.72 + b * 0.12)
        ctx.fillStyle = `rgba(${palette.rgb}, ${bandAlpha})`
        ctx.fill()

        ctx.beginPath()
        ctx.moveTo(points[0][0], points[0][1])
        for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1])
        ctx.strokeStyle = `rgba(${palette.rgb}, ${bandAlpha * CREST_ALPHA_MULTIPLIER})`
        ctx.lineWidth = CREST_LINE_WIDTH
        ctx.stroke()
      }

      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        const r = ripples[i]
        const age = (elapsed - r.born) / RIPPLE_DURATION
        if (age >= 1) {
          ripples.splice(i, 1)
          continue
        }
        /* Expands as it fades. Squashed vertically so the ring reads as lying
           on the water plane rather than facing the viewer. */
        const radius = RIPPLE_MAX_RADIUS * age
        ctx.beginPath()
        ctx.ellipse(r.x, r.y, radius, radius * 0.26, 0, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${palette.rgb}, ${
          palette.alpha * strength * 2.6 * (1 - age)
        })`
        ctx.lineWidth = 1.8
        ctx.stroke()
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

      if (fish.length > 0) {
        ctx.fillStyle = `rgba(${palette.inkRgb}, ${FISH_OPACITY_MULT * strength})`

        for (let i = fish.length - 1; i >= 0; i -= 1) {
          const f = fish[i]
          const t = (elapsed - f.born) / f.duration
          if (t >= 1) {
            /* Splash where it lands — same ripple the ambient ones use, so it
               reads as the same lake rather than a special effect. */
            ripples.push({ x: f.x0 + f.dx, y: f.baseY, born: elapsed })
            fish.splice(i, 1)
            continue
          }

          const x = f.x0 + f.dx * t
          const y = f.baseY - 4 * f.h * t * (1 - t)
          const vy = -4 * f.h * (1 - 2 * t)
          const facing = f.dx < 0 ? -1 : 1
          const pitch = Math.atan2(vy, Math.abs(f.dx) || 1)

          drawFish(ctx, x, y, pitch, facing, f.scale)
        }
      }
    }

    function schedule() {
      if (elapsed >= nextRippleAt) {
        const bandIndex = Math.floor(Math.random() * BANDS.length)
        const baseY =
          height *
          (layout.top + layout.spread * ((bandIndex + 0.5) / BANDS.length))
        ripples.push({
          x: randomBetween(width * 0.15, width * 0.85),
          y: baseY,
          born: elapsed,
        })
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

      if (elapsed >= nextFishAt) {
        /* Bands 1–3, skipping the farthest/faintest band 0 — a fish jumping
           out of the lightest, least visible water would be an odd sight. */
        const bandIndex = 1 + Math.floor(Math.random() * 3)
        const baseY =
          height *
          (layout.top + layout.spread * ((bandIndex + 0.5) / BANDS.length))
        const direction = Math.random() < 0.5 ? 1 : -1
        const dx = direction * randomBetween(FISH_ARC_DISTANCE_MIN, FISH_ARC_DISTANCE_MAX)
        const x0 = randomBetween(width * 0.2, width * 0.8)

        fish.push({
          born: elapsed,
          duration: randomBetween(FISH_DURATION_MIN, FISH_DURATION_MAX),
          x0,
          dx,
          baseY,
          h: randomBetween(FISH_ARC_HEIGHT_MIN, FISH_ARC_HEIGHT_MAX),
          scale: randomBetween(0.8, 1.3),
        })
        /* Splash where it leaves, matching the one added on landing above. */
        ripples.push({ x: x0, y: baseY, born: elapsed })

        nextFishAt = elapsed + randomBetween(FISH_MIN_GAP, FISH_MAX_GAP)
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
         the water — and does not fire a burst of queued events. */
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

    /* A theme swap changes --water-alpha and the ink the bird/fish are drawn in. */
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

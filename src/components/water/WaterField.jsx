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
 * The Prespa scene (`scene="prespa"`, home hero only): Golem Grad on the
 * horizon and pelicans floating on the water. The island shows at every width;
 * the pelicans only from this width up — below it the hero is a single column
 * and the birds would crowd the water under the text.
 */
const SCENE_MIN_WIDTH = 1024

/**
 * Golem Grad, traced from a reference photo taken from the lake. Normalised
 * coordinates throughout — x 0–1 left to right across the island, y 0 at the
 * top of the crown to 1 at the waterline. Everything is drawn in the water's
 * own blue, the same flat style as the bands, rather than as a picture.
 *
 * `ISLAND_CANOPY` is the line along the bottoms of the tree crowns: a steep
 * climb at the left end, the high point a third of the way along, then a
 * long gentle fall to the right. The crowns themselves are scalloped on top
 * of it when drawn, so it reads as forest, not a smooth hill.
 */
const ISLAND_CANOPY = [
  [0.03, 0.5], [0.05, 0.36], [0.08, 0.26], [0.12, 0.18], [0.19, 0.11],
  [0.26, 0.07], [0.33, 0.05], [0.42, 0.07], [0.48, 0.12], [0.55, 0.17],
  [0.62, 0.22], [0.71, 0.3], [0.8, 0.39], [0.87, 0.5], [0.94, 0.64],
  [0.985, 0.82],
]

/**
 * The bare rock under the trees: the long grey limestone wall across the left
 * half, a smaller face further right where the trees come down nearer the
 * water, and the strip of rocky shore along the base.
 */
const ISLAND_ROCKS = [
  [
    [0.012, 0.9], [0.016, 0.62], [0.04, 0.53], [0.07, 0.49], [0.1, 0.52],
    [0.14, 0.45], [0.19, 0.43], [0.24, 0.46], [0.29, 0.41], [0.35, 0.43],
    [0.4, 0.4], [0.45, 0.44], [0.5, 0.42], [0.54, 0.47], [0.555, 0.6],
    [0.585, 0.88],
  ],
  [
    [0.605, 0.88], [0.635, 0.63], [0.67, 0.57], [0.71, 0.6], [0.75, 0.56],
    [0.775, 0.63], [0.8, 0.88],
  ],
  [[0, 0.88], [0.8, 0.87], [0.9, 0.94], [0.92, 1], [0, 1]],
]

/**
 * The mainland hills behind, as a fraction of the island's width and height
 * so they scale with it. One ridge falls in from the left, one rises away to
 * the right; the island sits in the dip between them, as in the photo.
 */
const ISLAND_HILLS = [
  [[-0.4, 1], [-0.3, 0.62], [-0.2, 0.4], [-0.11, 0.36], [-0.03, 0.48], [0.06, 1]],
  [[0.9, 1], [0.99, 0.6], [1.1, 0.4], [1.24, 0.3], [1.42, 0.38], [1.7, 0.58], [2.1, 0.8], [2.6, 1]],
]

/** Fraction of the canvas width the island spans, capped in pixels. */
const ISLAND_WIDTH = 0.32
const ISLAND_MAX_WIDTH = 520
const ISLAND_ASPECT = 0.15
/** Left edge of the island, as a fraction of the canvas width. */
const ISLAND_LEFT = 0.6
/** Below `SCENE_MIN_WIDTH` the island sits in the open water under the
 *  single-column text instead, larger so it still reads at phone size. */
const ISLAND_WIDTH_NARROW = 0.68
const ISLAND_LEFT_NARROW = 0.14

/** Once `sceneVisible` turns on, the island fades in over this many seconds,
 *  and the pelicans follow after `PELICAN_FADE_DELAY`. */
const SCENE_FADE = 1.6
const PELICAN_FADE_DELAY = 0.6

/**
 * Pelicans floating on the water. Each rides one band's surface, bobbing and
 * tilting with it, and drifts slowly sideways, wrapping past the edges.
 * `x` is the starting position as a fraction of the width; `speed` is in
 * px/s of water time. Nearer bands get larger birds.
 */
const PELICANS = [
  { band: 2, x: 0.56, direction: -1, speed: 5, scale: 1.05 },
  { band: 2, x: 0.62, direction: -1, speed: 5, scale: 0.92 },
  { band: 1, x: 0.86, direction: 1, speed: 3.5, scale: 0.78 },
]
const PELICAN_OPACITY_MULT = 0.55

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
 * @param {number} fx 0–1 across the island.
 * @returns {number} `ISLAND_CANOPY`'s y at `fx`, linearly interpolated.
 */
function canopyAt(fx) {
  const pts = ISLAND_CANOPY
  if (fx <= pts[0][0]) return pts[0][1]
  for (let i = 1; i < pts.length; i += 1) {
    if (fx <= pts[i][0]) {
      const [x0, y0] = pts[i - 1]
      const [x1, y1] = pts[i]
      return y0 + ((fx - x0) / (x1 - x0)) * (y1 - y0)
    }
  }
  return pts[pts.length - 1][1]
}

/**
 * Golem Grad, in layers back to front, all in the water's blue:
 *
 * - the mainland hills behind it, faint, cut out where the island stands;
 * - a squashed reflection under the waterline, which the bands then wash over;
 * - the wooded crown, densest, its top scalloped into tree crowns, with a few
 *   rows of smaller crowns inside so it reads as forest;
 * - the bare rock — the long cliff wall, the smaller face, the rocky shore —
 *   paler, the way the grey limestone is lighter than the trees in the photo,
 *   streaked like the rock is;
 * - a crest line along the top, the same as the bands have.
 *
 * Every irregularity comes from the loop index, not `Math.random`, so the
 * island is the same shape on every frame and every visit.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} left Left edge, CSS pixels.
 * @param {number} waterline Y of the island's base, CSS pixels.
 * @param {number} w Width, CSS pixels.
 * @param {number} h Height, CSS pixels.
 * @param {string} rgb Water tint as an "r, g, b" triple.
 * @param {number} alpha Fill alpha of the trees; everything else derives from it.
 */
function drawIsland(ctx, left, waterline, w, h, rgb, alpha) {
  const X = (fx) => left + fx * w
  const Y = (fy) => waterline - h + fy * h
  const tint = (a) => `rgba(${rgb}, ${Math.min(a, 0.7)})`

  /* Open path: left side, the scalloped crown, right side. Closing it adds
     the base along the waterline, which only fills should get. */
  const silhouette = () => {
    ctx.moveTo(X(0), Y(1))
    ctx.lineTo(X(0), Y(0.9))
    ctx.lineTo(X(0.012), Y(0.86))
    ctx.lineTo(X(0.016), Y(0.62))
    ctx.lineTo(X(ISLAND_CANOPY[0][0]), Y(ISLAND_CANOPY[0][1]))

    const end = ISLAND_CANOPY[ISLAND_CANOPY.length - 1][0]
    for (let fx = ISLAND_CANOPY[0][0], i = 0; fx < end; i += 1) {
      const next = Math.min(fx + 0.016 + ((i * 7) % 5) * 0.004, end)
      const bump = h * (0.035 + ((i * 3) % 4) * 0.014 + ((i * 5) % 3) * 0.008)
      const ya = Y(canopyAt(fx))
      const yb = Y(canopyAt(next))
      ctx.quadraticCurveTo(X((fx + next) / 2), Math.min(ya, yb) - bump * 2, X(next), yb)
      fx = next
    }

    ctx.lineTo(X(1), Y(0.96))
    ctx.lineTo(X(1), Y(1))
  }

  const rocks = () => {
    for (const poly of ISLAND_ROCKS) {
      ctx.moveTo(X(poly[0][0]), Y(poly[0][1]))
      for (let i = 1; i < poly.length; i += 1) ctx.lineTo(X(poly[i][0]), Y(poly[i][1]))
      ctx.closePath()
    }
  }

  // Hills behind, with the island's shape cut out of them.
  ctx.save()
  ctx.beginPath()
  ctx.rect(X(-3), Y(-1), w * 7, h * 2)
  silhouette()
  ctx.closePath()
  ctx.clip('evenodd')
  ctx.beginPath()
  for (const ridge of ISLAND_HILLS) {
    const pts = ridge.map(([x, y]) => [X(x), Y(y)])
    ctx.moveTo(pts[0][0], pts[0][1])
    for (let i = 1; i < pts.length - 1; i += 1) {
      ctx.quadraticCurveTo(
        pts[i][0],
        pts[i][1],
        (pts[i][0] + pts[i + 1][0]) / 2,
        (pts[i][1] + pts[i + 1][1]) / 2,
      )
    }
    ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1])
    ctx.closePath()
  }
  ctx.fillStyle = tint(alpha * 0.3)
  ctx.fill()
  ctx.restore()

  // Reflection: mirrored about the waterline and squashed.
  ctx.save()
  ctx.beginPath()
  ctx.rect(X(-0.1), waterline, w * 1.2, h)
  ctx.clip()
  ctx.translate(0, waterline)
  ctx.scale(1, -0.45)
  ctx.translate(0, -waterline)
  ctx.beginPath()
  silhouette()
  ctx.closePath()
  ctx.fillStyle = tint(alpha * 0.25)
  ctx.fill()
  ctx.restore()

  // The wooded crown, and the rows of smaller crowns inside it.
  ctx.beginPath()
  silhouette()
  ctx.closePath()
  ctx.fillStyle = tint(alpha)
  ctx.fill()

  ctx.save()
  ctx.beginPath()
  silhouette()
  ctx.closePath()
  ctx.clip()
  ctx.strokeStyle = tint(alpha * 0.9)
  ctx.lineWidth = 1
  for (let row = 1; row <= 2; row += 1) {
    for (let fx = 0.06 + row * 0.02, i = 0; fx < 0.95; fx += 0.05 + ((i * 5) % 3) * 0.02, i += 1) {
      const fy = canopyAt(fx) + row * 0.12
      if (fy > 0.84) continue
      const half = w * (0.008 + (i % 2) * 0.003)
      ctx.beginPath()
      ctx.moveTo(X(fx) - half, Y(fy))
      ctx.quadraticCurveTo(X(fx), Y(fy) - h * 0.07, X(fx) + half, Y(fy))
      ctx.stroke()
    }
  }
  ctx.restore()

  /* The rock replaces the trees where it shows: erase them there, then fill
     with the paler tone. Safe to erase — nothing has been drawn inside the
     island's outline except the island. */
  ctx.save()
  ctx.beginPath()
  silhouette()
  ctx.closePath()
  ctx.clip()
  ctx.beginPath()
  rocks()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = '#000'
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = tint(alpha * 0.42)
  ctx.fill()

  ctx.clip()
  ctx.strokeStyle = tint(alpha * 1.1)
  ctx.lineWidth = 1

  // Vertical streaks down the rock, of uneven length.
  for (let fx = 0.025, i = 0; fx < 0.8; fx += 0.011 + ((i * 7) % 4) * 0.006, i += 1) {
    const top = Y(0.4 + ((i * 3) % 5) * 0.06)
    const bottom = Y(0.86 - (i % 3) * 0.08)
    if (bottom <= top) continue
    ctx.beginPath()
    ctx.moveTo(X(fx), top)
    ctx.lineTo(X(fx + 0.003), bottom)
    ctx.stroke()
  }


  // Boulders along the shore.
  ctx.fillStyle = tint(alpha * 1.1)
  for (let fx = 0.02, i = 0; fx < 0.8; fx += 0.03 + ((i * 3) % 4) * 0.012, i += 1) {
    ctx.beginPath()
    ctx.ellipse(X(fx), Y(0.95), w * (0.005 + (i % 3) * 0.002), h * 0.04, 0, Math.PI, 0)
    ctx.fill()
  }
  ctx.restore()

  // The top edges of the two cliff faces, where the trees end.
  ctx.strokeStyle = tint(alpha * 1.6)
  ctx.lineWidth = 1
  for (const poly of ISLAND_ROCKS.slice(0, 2)) {
    ctx.beginPath()
    ctx.moveTo(X(poly[1][0]), Y(poly[1][1]))
    for (let i = 2; i < poly.length - 1; i += 1) ctx.lineTo(X(poly[i][0]), Y(poly[i][1]))
    ctx.stroke()
  }

  // Crest line along the top, like the bands.
  ctx.beginPath()
  silhouette()
  ctx.strokeStyle = tint(alpha * 2.4)
  ctx.lineWidth = CREST_LINE_WIDTH
  ctx.stroke()
}

/**
 * A pelican floating on the water: a bulky body riding high, a short thick
 * neck curved back over it, and the long bill angled down with its pouch —
 * the bill is what makes it read as a pelican rather than a duck. Drawn
 * facing +x; `facing` mirrors it, and `tilt` rocks it with the slope of the
 * wave underneath.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y Waterline under the bird.
 * @param {number} scale
 * @param {1 | -1} facing
 * @param {number} tilt Radians.
 */
function drawPelican(ctx, x, y, scale, facing, tilt) {
  ctx.save()
  ctx.translate(x, y)
  if (facing === -1) ctx.scale(-1, 1)
  ctx.rotate(tilt)
  ctx.scale(scale, scale)

  // Body, riding high on the water, tail end slightly raised.
  ctx.beginPath()
  ctx.moveTo(-17, 0)
  ctx.quadraticCurveTo(-21, -8, -12, -11)
  ctx.quadraticCurveTo(0, -15, 9, -11)
  ctx.quadraticCurveTo(15, -8, 15, -2)
  ctx.quadraticCurveTo(15, 0, 11, 0)
  ctx.closePath()
  ctx.fill()

  // Short, thick neck curving back over the body.
  ctx.beginPath()
  ctx.moveTo(9, -10)
  ctx.bezierCurveTo(6, -16, 3, -21, 7, -25)
  ctx.lineWidth = 4.5
  ctx.lineCap = 'round'
  ctx.stroke()

  // Head.
  ctx.beginPath()
  ctx.ellipse(8, -26, 3.6, 3, 0, 0, Math.PI * 2)
  ctx.fill()

  // Long bill angled down, with the pouch hanging under it.
  ctx.beginPath()
  ctx.moveTo(10, -27.5)
  ctx.lineTo(27, -18)
  ctx.lineTo(25.5, -16.5)
  ctx.quadraticCurveTo(16, -17, 10, -22.5)
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
 * @param {'prespa'} [props.scene] Adds Golem Grad on the horizon at every
 *   width, and pelicans floating on the water at desktop widths only
 *   (`SCENE_MIN_WIDTH`). Home hero only.
 * @param {boolean} [props.sceneVisible=true] Holds the scene back while false,
 *   then fades it in (`SCENE_FADE`) — the hero keeps it hidden until the
 *   dandelion intro has finished. Read through a ref, so flipping it does not
 *   restart the water.
 * @param {string} [props.className] Extra classes for the canvas.
 * @returns {JSX.Element}
 */
export function WaterField({
  variant = 'lake',
  intensity = 1,
  timeScale = 1,
  scene,
  sceneVisible = true,
  className,
}) {
  const reducedMotion = useReducedMotion()
  const canvasRef = useRef(/** @type {HTMLCanvasElement | null} */ (null))

  const sceneVisibleRef = useRef(sceneVisible)
  /** Set by the main effect: redraws once when no loop is running to do it. */
  const redrawRef = useRef(/** @type {(() => void) | null} */ (null))
  useEffect(() => {
    sceneVisibleRef.current = sceneVisible
    redrawRef.current?.()
  }, [sceneVisible])

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

    /* Re-checked on every resize, so shrinking the window below desktop width
       removes the pelicans and moves the island, and widening it brings them
       back. */
    const islandOn = scene === 'prespa'
    let wide = false
    /** Water time at which `sceneVisible` was first seen true. */
    let sceneShownAt = /** @type {number | null} */ (null)

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
      wide = window.matchMedia(`(min-width: ${SCENE_MIN_WIDTH}px)`).matches
    }

    function draw() {
      ctx.clearRect(0, 0, width, height)
      if (width === 0 || height === 0) return

      /* Bands are filled down to the bottom edge, so they stack. The overlap is
         what makes the water read as denser near the viewer and lighter towards
         the horizon, without shading each band separately. The crest line reuses
         the same sampled points as an open, unfilled stroke on top — see the
         file-level comment for why the fill alone was never enough contrast. */

      /* 0 until the scene is let in, then easing up to 1. Reduced motion
         skips the fade — it only ever gets the one frame. */
      let islandFade = 0
      let pelicanFade = 0
      if (islandOn && sceneVisibleRef.current) {
        if (sceneShownAt === null) sceneShownAt = elapsed
        const since = elapsed - sceneShownAt
        const ease = (t) => 1 - (1 - Math.min(Math.max(t, 0), 1)) ** 3
        islandFade = reducedMotion ? 1 : ease(since / SCENE_FADE)
        pelicanFade = reducedMotion ? 1 : ease((since - PELICAN_FADE_DELAY) / SCENE_FADE)
      }

      /* The island goes down first, so the waves wash over its base. */
      if (islandFade > 0) {
        const islandW = Math.min(
          width * (wide ? ISLAND_WIDTH : ISLAND_WIDTH_NARROW),
          ISLAND_MAX_WIDTH,
        )
        const horizon =
          height * (layout.top + layout.spread * (0.5 / BANDS.length))
        drawIsland(
          ctx,
          width * (wide ? ISLAND_LEFT : ISLAND_LEFT_NARROW),
          horizon + 4,
          islandW,
          islandW * ISLAND_ASPECT,
          palette.rgb,
          palette.alpha * strength * 2.6 * islandFade,
        )
      }

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

        /* Pelicans riding this band, drawn now so nearer bands pass in front
           of farther birds. */
        if (pelicanFade > 0 && wide) {
          ctx.fillStyle = `rgba(${palette.inkRgb}, ${PELICAN_OPACITY_MULT * strength * pelicanFade})`
          ctx.strokeStyle = ctx.fillStyle
          for (const p of PELICANS) {
            if (p.band !== b) continue
            const span = width + 80
            let x = (p.x * width + 40 + p.direction * p.speed * elapsed) % span
            if (x < 0) x += span
            x -= 40
            const surface = (at) => baseY + surfaceOffset(band, at, width, elapsed) * strength
            const tilt = Math.atan2(surface(x + 6) - surface(x - 6), 12)
            drawPelican(ctx, x, surface(x) + 1, p.scale, p.direction, tilt)
          }
        }
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

    /* A running loop picks up `sceneVisible` on its next frame by itself. */
    redrawRef.current = () => {
      if (!running) draw()
    }

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
        redrawRef.current = null
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
      redrawRef.current = null
      stop()
      clearTimeout(resizeTimer)
      resizeObserver.disconnect()
      themeObserver.disconnect()
      inViewObserver.disconnect()
      document.removeEventListener('visibilitychange', syncRunning)
    }
  }, [variant, intensity, timeScale, scene, reducedMotion])

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

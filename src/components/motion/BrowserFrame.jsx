import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

/** How small the frame starts before settling at its full size. */
const SCALE_FROM = 0.92

/**
 * A screenshot inside a plain browser-window chrome that grows in as it
 * scrolls into view and shrinks back if you scroll back up past it.
 *
 * This is deliberately continuous, not the one-shot wipe in `ImageWipe` — an
 * image in this frame should never also carry `ImageWipe`. Stacking a
 * one-time reveal on top of a continuous scroll-driven scale would be two
 * scroll-triggered animations competing for the same viewport, which the
 * motion rules in CLAUDE.md rule out. This owns its own entrance instead.
 *
 * The scale tracks `scrollYProgress` only across the frame's entry — from its
 * top crossing 90% down the viewport, to its top crossing 40% down — mapped to
 * `[SCALE_FROM, 1]`. `useTransform` is a continuous mapping of scroll position,
 * not a one-shot trigger, so scrolling back up through that same range
 * naturally reverses it: the frame shrinks back exactly the way it grew. It
 * does not shrink again on exit at the top — only entering, and undoing that
 * entrance — since that's the brief this was built against.
 *
 * Scaling is applied as a `transform` (Motion's `style={{ scale }}`), which is
 * compositor-only and never reflows the layout around it, so nothing shifts
 * as it animates.
 *
 * Coexists with Lenis (see SmoothScroll.jsx) rather than fighting it: Lenis
 * drives real `window.scrollTo` under the hood, and Motion's scroll tracking
 * re-reads actual position on every animation frame rather than depending
 * only on a native `scroll` event, so it sees the same position Lenis does.
 * Not verified in a real browser from here — if the growth ever looks
 * stepped or laggy against the smoothed scroll, that pairing is where to look
 * first.
 *
 * Reduced motion renders the chrome and the image at their final size, no
 * scroll listener at all.
 *
 * @param {object} props
 * @param {string} props.src
 * @param {string} props.alt Empty string only if the image is decorative.
 * @param {number} props.width Intrinsic width, for the aspect ratio.
 * @param {number} props.height Intrinsic height, for the aspect ratio.
 * @param {boolean} [props.priority=false] Load eagerly. Above-the-fold images only.
 * @param {string} [props.className] Classes for the frame.
 * @param {string} [props.imgClassName] Classes for the `<img>` itself.
 * @returns {JSX.Element}
 */
export function BrowserFrame({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  imgClassName,
}) {
  const reducedMotion = useReducedMotion()
  const frameRef = useRef(/** @type {HTMLDivElement | null} */ (null))

  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ['start 0.9', 'start 0.4'],
  })
  const scale = useTransform(scrollYProgress, [0, 1], [SCALE_FROM, 1])

  const chrome = (
    <div
      aria-hidden="true"
      className="flex h-8 shrink-0 items-center gap-1.5 border-b border-hairline bg-surface-raised px-3"
    >
      <span className="size-2 rounded-full bg-secondary/35" />
      <span className="size-2 rounded-full bg-secondary/35" />
      <span className="size-2 rounded-full bg-secondary/35" />
    </div>
  )

  const image = (
    <div style={{ aspectRatio: `${width} / ${height}` }}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn('block h-full w-full object-cover', imgClassName)}
      />
    </div>
  )

  if (reducedMotion) {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-(--radius-base) border border-hairline',
          className,
        )}
      >
        {chrome}
        {image}
      </div>
    )
  }

  return (
    <motion.div
      ref={frameRef}
      style={{ scale }}
      className={cn(
        'overflow-hidden rounded-(--radius-base) border border-hairline',
        className,
      )}
    >
      {chrome}
      {image}
    </motion.div>
  )
}

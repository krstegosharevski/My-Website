import { motion, useInView } from 'motion/react'
import { useRef } from 'react'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

/** §3.5.6: 800ms clip-path wipe with a 1.06→1 scale inside. Never a plain fade. */
const DURATION = 0.8
const EASE = [0.16, 1, 0.3, 1]
const SCALE_FROM = 1.06

/**
 * The only way an image is allowed to arrive: a `clip-path: inset()` wipe from
 * the bottom edge, with the image scaling from 1.06 to 1 inside the mask so the
 * frame and the picture move at different rates.
 *
 * `width` and `height` are required and are set as real attributes, so the box
 * is reserved before the file loads and nothing shifts.
 *
 * The in-view check runs on a plain wrapper `<div>` that carries no styling of
 * its own, not on the clip-path element itself. Confirmed with a controlled
 * `IntersectionObserver` test (identical element, only the `clip-path` value
 * changed): a browser's `IntersectionObserver` accounts for an element's own
 * `clip-path` when computing whether it is intersecting, so a `whileInView`
 * trigger placed directly on this element deadlocks permanently — its
 * `initial` state is `inset(100% …)` (zero visible area), which makes it
 * report as never-intersecting from the very first frame, so the thing meant
 * to reveal it can never detect it as visible. Every image built with this
 * component was affected — this was not new, and not specific to any one
 * page. `useInView` on the wrapper reads real, unclipped geometry, and once
 * true drives `animate` on the two inner elements instead of `whileInView`.
 *
 * Under reduced motion the image renders fully revealed and unscaled.
 *
 * @param {object} props
 * @param {string} props.src
 * @param {string} props.alt Empty string only if the image is decorative.
 * @param {number} props.width Intrinsic width, for the aspect ratio.
 * @param {number} props.height Intrinsic height, for the aspect ratio.
 * @param {boolean} [props.priority=false] Load eagerly. Above-the-fold images only.
 * @param {number} [props.delay=0] Seconds before the wipe starts.
 * @param {string} [props.className] Classes for the clipping frame.
 * @param {string} [props.imgClassName] Classes for the `<img>` itself.
 * @returns {JSX.Element}
 */
export function ImageWipe({
  src,
  alt,
  width,
  height,
  priority = false,
  delay = 0,
  className,
  imgClassName,
}) {
  const reducedMotion = useReducedMotion()
  const wrapperRef = useRef(/** @type {HTMLDivElement | null} */ (null))
  const inView = useInView(wrapperRef, { once: true, amount: 0.2 })

  /* The frame reserves the box from the intrinsic ratio, so the layout is final
     before the file arrives. Relying on the img's own implicit ratio works but
     depends on a percentage height resolving to auto — this states it. */
  const frameStyle = { aspectRatio: `${width} / ${height}` }

  const image = (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={cn('block h-full w-full object-cover', imgClassName)}
    />
  )

  if (reducedMotion) {
    return (
      <div className={cn('overflow-hidden', className)} style={frameStyle}>
        {image}
      </div>
    )
  }

  return (
    <div ref={wrapperRef}>
      <motion.div
        className={cn('overflow-hidden', className)}
        style={frameStyle}
        initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
        animate={inView ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
        transition={{ duration: DURATION, ease: EASE, delay }}
      >
        <motion.div
          className="h-full w-full"
          initial={{ scale: SCALE_FROM }}
          animate={inView ? { scale: 1 } : undefined}
          transition={{ duration: DURATION, ease: EASE, delay }}
        >
          {image}
        </motion.div>
      </motion.div>
    </div>
  )
}

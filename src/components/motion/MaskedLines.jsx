import { motion, useInView } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

/** §3.5.2: 700ms, cubic-bezier(0.16, 1, 0.3, 1), 70ms stagger. */
const DURATION = 0.7
const EASE = [0.16, 1, 0.3, 1]
const STAGGER = 0.07
const RESIZE_DEBOUNCE = 150

/**
 * Group the measured word spans into visual lines by their vertical offset.
 *
 * @param {HTMLElement} el Container holding the `[data-word]` spans.
 * @returns {string[]} One string per rendered line.
 */
function measureLines(el) {
  /** @type {string[][]} */
  const grouped = []
  let previousTop = null

  for (const word of el.querySelectorAll('[data-word]')) {
    const top = word.offsetTop
    /* Sub-pixel jitter between words on the same line is normal, so compare
       with a tolerance rather than for equality. */
    if (previousTop === null || Math.abs(top - previousTop) > 1) {
      grouped.push([])
      previousTop = top
    }
    grouped[grouped.length - 1].push(word.textContent ?? '')
  }

  return grouped.map((line) => line.join(' '))
}

/**
 * The masked line rise from §3.5.2, and the only heading animation on the site.
 *
 * The text is measured once as wrapped words, grouped into the lines the
 * browser actually drew, and each line is then re-rendered inside its own
 * `overflow: hidden` box and translated from 110% to 0. Lines are re-split when
 * the container's width changes and again once webfonts have loaded, since both
 * change where the text breaks.
 *
 * **h1 and h2 only.** Everything else uses `Reveal`.
 *
 * Under reduced motion the text renders as ordinary text in its final state —
 * no masking boxes, no transforms.
 *
 * @param {object} props
 * @param {string} props.text The heading. Plain text, so it can be split.
 * @param {'h1' | 'h2'} [props.as='h2'] Heading level. Keep the page order sequential.
 * @param {number} [props.delay=0] Seconds to wait before the first line rises.
 * @param {boolean} [props.play] Override the in-view trigger. Omit for the
 *   default behaviour; pass `false` to hold the lines down and `true` to
 *   release them. The home hero uses this to rise on the dandelion intro's
 *   `onComplete` rather than on mount.
 * @param {string} [props.className] Extra classes.
 * @returns {JSX.Element}
 */
export function MaskedLines({ text, as: Tag = 'h2', delay = 0, play, className }) {
  const reducedMotion = useReducedMotion()
  const containerRef = useRef(/** @type {HTMLElement | null} */ (null))
  const widthRef = useRef(0)

  /** `null` means "not measured yet", which renders the measuring pass. */
  const [lines, setLines] = useState(/** @type {string[] | null} */ (null))

  /* The rise happens once in the element's life. A re-split changes the line
     strings, which remounts the spans — without this the heading would play the
     whole animation again when webfonts land or the window is resized. */
  const [hasPlayed, setHasPlayed] = useState(false)

  const inView = useInView(containerRef, { once: true, amount: 0.2 })

  /* `play` overrides the in-view trigger when the caller passes it. Both still
     have to be satisfied, so a gated heading further down the page does not
     rise before it has been scrolled to. */
  const shouldRise = play === undefined ? inView : play && inView

  /* New text breaks differently, so the split is discarded during render rather
     than in an effect — React re-runs this render immediately and the stale
     lines are never painted. */
  const [measuredText, setMeasuredText] = useState(text)
  if (measuredText !== text) {
    setMeasuredText(text)
    setLines(null)
  }

  useLayoutEffect(() => {
    if (reducedMotion || lines !== null) return
    const el = containerRef.current
    if (!el) return

    widthRef.current = el.getBoundingClientRect().width
    setLines(measureLines(el))
  }, [lines, reducedMotion])

  /* A width change re-breaks the text, so the split has to be redone. Height
     changes are ignored — the re-render itself changes the height, and reacting
     to that would loop. */
  useEffect(() => {
    const el = containerRef.current
    if (!el || reducedMotion) return undefined

    let timer
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width
      if (Math.abs(width - widthRef.current) < 1) return

      clearTimeout(timer)
      timer = setTimeout(() => {
        widthRef.current = width
        setLines(null)
      }, RESIZE_DEBOUNCE)
    })

    observer.observe(el)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [reducedMotion])

  /* Newsreader arrives after first paint and changes where lines break, so the
     first measurement is discarded once the fonts are ready. */
  useEffect(() => {
    if (reducedMotion || !document.fonts) return undefined

    let cancelled = false
    document.fonts.ready.then(() => {
      if (!cancelled) setLines(null)
    })

    return () => {
      cancelled = true
    }
  }, [reducedMotion])

  if (reducedMotion) {
    return <Tag className={className}>{text}</Tag>
  }

  /* Measuring pass. Rendered invisibly so the un-split text is never seen, but
     still laid out so offsets are real. */
  if (lines === null) {
    const words = text.split(/\s+/).filter(Boolean)
    return (
      <Tag ref={containerRef} className={cn('invisible', className)}>
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            <span data-word="">{word}</span>{' '}
          </span>
        ))}
      </Tag>
    )
  }

  return (
    <Tag ref={containerRef} className={className}>
      {lines.map((line, i) => (
        <span key={`${line}-${i}`} className="mask-line">
          <motion.span
            className="block"
            initial={hasPlayed ? false : { y: '110%' }}
            animate={shouldRise || hasPlayed ? { y: '0%' } : { y: '110%' }}
            transition={{
              duration: DURATION,
              ease: EASE,
              delay: delay + i * STAGGER,
            }}
            onAnimationComplete={
              i === lines.length - 1 ? () => setHasPlayed(true) : undefined
            }
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

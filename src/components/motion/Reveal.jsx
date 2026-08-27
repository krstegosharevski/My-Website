import { motion } from 'motion/react'

import { useReducedMotion } from '@/hooks/useReducedMotion'

/** §3.5.3: opacity 0→1 plus a 12px rise, 500ms, 60ms stagger. */
const DURATION = 0.5
const RISE = 12
const STAGGER = 0.06

/**
 * The quiet reveal used by everything that is not an h1 or h2.
 *
 * Pass `index` to stagger a group: sibling reveals sharing a list index get the
 * 60ms offset from §3.5.3 without any coordinating parent.
 *
 * Under reduced motion the child renders at full opacity in its final position,
 * with no transform and no transition.
 *
 * @param {object} props
 * @param {number} [props.index=0] Position in a staggered group.
 * @param {number} [props.delay=0] Extra seconds before this element starts.
 * @param {boolean} [props.play] Override the in-view trigger. Omit for the
 *   default behaviour; pass `false` to hold the element down and `true` to
 *   release it. The home hero uses this so the lead and buttons follow the
 *   headline rather than appearing while the dandelion is still on screen.
 * @param {React.ElementType} [props.as='div'] Element to render.
 * @param {string} [props.className] Extra classes.
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export function Reveal({
  index = 0,
  delay = 0,
  play,
  as = 'div',
  className,
  children,
  ...rest
}) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    const Plain = as
    return (
      <Plain className={className} {...rest}>
        {children}
      </Plain>
    )
  }

  /* `motion[tag]` is the library's cached proxy. Calling `motion.create(as)`
     here instead would mint a new component type on every render and remount
     the subtree mid-animation. */
  const Tag = motion[as]

  /* Without `play` the element reveals when scrolled to. With it, the caller
     drives the timing and the in-view trigger is dropped entirely — the hero
     is already in view on load, so leaving it on would fire immediately and
     defeat the point. */
  const trigger =
    play === undefined
      ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 } }
      : { animate: play ? { opacity: 1, y: 0 } : { opacity: 0, y: RISE } }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: RISE }}
      {...trigger}
      transition={{
        duration: DURATION,
        ease: 'easeOut',
        delay: delay + index * STAGGER,
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

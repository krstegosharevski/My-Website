import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

/**
 * Slow continuous horizontal scroll, per §3.5.7. Pauses on hover, and on
 * keyboard focus landing anywhere inside it.
 *
 * The children are rendered twice. The duplicate is `aria-hidden` and the whole
 * track is presentational to assistive tech, so a screen reader hears the list
 * once rather than seeing it repeat.
 *
 * Under reduced motion the track renders static, showing one copy.
 *
 * @param {object} props
 * @param {number} [props.duration=40] Seconds for one full pass. Higher is slower.
 * @param {string} [props.className] Extra classes for the clipping frame.
 * @param {React.ReactNode} props.children Row content, laid out inline.
 * @returns {JSX.Element}
 */
export function Marquee({ duration = 40, className, children }) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return (
      <div className={cn('overflow-hidden', className)}>
        <div className="flex w-max items-center">{children}</div>
      </div>
    )
  }

  return (
    <div className={cn('group overflow-hidden', className)}>
      <div
        className={cn(
          'flex w-max items-center animate-marquee',
          'group-hover:[animation-play-state:paused]',
          'group-focus-within:[animation-play-state:paused]',
        )}
        style={{ '--marquee-duration': `${duration}s` }}
      >
        <div className="flex items-center">{children}</div>
        <div className="flex items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}

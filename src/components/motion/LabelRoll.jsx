import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

/**
 * The hover label roll from §3.5.4, shared by buttons and nav links.
 *
 * The label is rendered twice inside a masked box. On hover the first copy
 * slides up and out as the duplicate slides in behind it, over 300ms. The
 * duplicate is `aria-hidden`, so the label is announced once.
 *
 * The trigger is `group-hover`, so the nearest ancestor with the `group` class
 * — the button or link itself — drives it. Under reduced motion the duplicate
 * is not rendered at all, leaving the label in its final state rather than in a
 * paused animation.
 *
 * @param {object} props
 * @param {string} [props.className] Extra classes for the masked box.
 * @param {React.ReactNode} props.children Label content.
 * @returns {JSX.Element}
 */
export function LabelRoll({ className, children }) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return <span className={cn('block', className)}>{children}</span>
  }

  return (
    <span className={cn('relative block overflow-hidden', className)}>
      <span className="block transition-transform duration-(--duration-hover) ease-(--ease-out-quart) group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 block translate-y-full transition-transform duration-(--duration-hover) ease-(--ease-out-quart) group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  )
}

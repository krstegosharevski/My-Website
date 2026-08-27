import { Link } from 'react-router-dom'

import { LabelRoll } from '@/components/motion/LabelRoll'
import { cn } from '@/lib/cn'

/**
 * @typedef {'signal' | 'outline' | 'ghost'} ButtonVariant
 */

const VARIANTS = {
  /* The one pill on the site. Everything else is 4px. */
  signal:
    'rounded-full bg-signal text-white hover:bg-signal-ink dark:hover:bg-signal-lo dark:hover:text-ink',
  outline: 'rounded-(--radius-base) border border-hairline hover:border-signal',
  ghost: 'rounded-(--radius-base) text-secondary hover:text-primary',
}

/**
 * Buttons and button-shaped links.
 *
 * Renders a `<button>` by default, a react-router `<Link>` when given `to`, or
 * an `<a>` when given `href`. Buttons name the outcome — "Send message", not
 * "Submit" — and the same word carries through the flow.
 *
 * The label carries the hover roll from §3.5.4 via `LabelRoll`.
 *
 * @param {object} props
 * @param {ButtonVariant} [props.variant='signal'] Visual weight.
 * @param {string} [props.to] Internal route. Renders a react-router Link.
 * @param {string} [props.href] External URL. Renders an anchor.
 * @param {'button' | 'submit' | 'reset'} [props.type='button'] Native button type.
 * @param {boolean} [props.disabled] Disable the control.
 * @param {string} [props.className] Extra classes.
 * @param {React.ReactNode} props.children Label.
 * @returns {JSX.Element}
 */
export function Button({
  variant = 'signal',
  to,
  href,
  type = 'button',
  disabled,
  className,
  children,
  ...rest
}) {
  const classes = cn(
    'group inline-flex items-center justify-center px-6 py-3',
    'font-sans text-base leading-none',
    'transition-colors duration-(--duration-hover)',
    VARIANTS[variant],
    disabled && 'pointer-events-none opacity-40',
    className,
  )

  const label = <LabelRoll>{children}</LabelRoll>

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        aria-disabled={disabled || undefined}
        {...rest}
      >
        {label}
      </Link>
    )
  }

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        aria-disabled={disabled || undefined}
        {...rest}
      >
        {label}
      </a>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {label}
    </button>
  )
}

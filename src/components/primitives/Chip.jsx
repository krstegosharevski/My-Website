import { cn } from '@/lib/cn'

/**
 * Mono tag. Static by default; pass `onClick` to get the work-index filter
 * behaviour, which renders a real button with a pressed state.
 *
 * @param {object} props
 * @param {boolean} [props.selected=false] Filled signal state. Only meaningful when interactive.
 * @param {() => void} [props.onClick] Makes the chip a button.
 * @param {string} [props.className] Extra classes.
 * @param {React.ReactNode} props.children Label.
 * @returns {JSX.Element}
 */
export function Chip({ selected = false, onClick, className, children, ...rest }) {
  const classes = cn(
    'inline-flex items-center rounded-(--radius-base) border px-3 py-1.5',
    'font-mono text-label tracking-(--text-label--letter-spacing) uppercase',
    'transition-colors duration-(--duration-hover)',
    selected
      ? 'border-signal bg-signal text-white'
      : 'border-hairline text-secondary',
    onClick && !selected && 'hover:border-signal hover:text-primary',
    className,
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={classes}
        {...rest}
      >
        {children}
      </button>
    )
  }

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  )
}

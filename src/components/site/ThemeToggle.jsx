import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/cn'

/**
 * Light/dark switch. Reads and writes the single `.dark` class on `<html>`.
 *
 * The icon is a sun or moon drawn inline — not an emoji, and not from a general
 * icon set. The label is only ever exposed to assistive tech; the control is a
 * square to match the footer's social marks.
 *
 * @param {object} props
 * @param {string} [props.className] Extra classes for the button.
 * @returns {JSX.Element}
 */
export function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-(--radius-base)',
        'border border-hairline text-secondary',
        'transition-colors duration-(--duration-hover)',
        'hover:border-signal hover:text-primary',
        className,
      )}
    >
      <span className="sr-only">
        {isDark ? 'Switch to the light theme' : 'Switch to the dark theme'}
      </span>
      {isDark ? (
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.6v2.2M12 19.2v2.2M4.2 12H2M22 12h-2.2M6.3 6.3 4.8 4.8M19.2 19.2l-1.5-1.5M17.7 6.3l1.5-1.5M4.8 19.2l1.5-1.5" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1Z" />
        </svg>
      )}
    </button>
  )
}

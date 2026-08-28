import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import avatar from '@/assets/avatar.png'
import { LabelRoll } from '@/components/motion/LabelRoll'
import { Button } from '@/components/primitives/Button'
import { Container } from '@/components/primitives/Container'
import { ThemeToggle } from '@/components/site/ThemeToggle'
import { NAV_CTA, NAV_ITEMS, WORDMARK } from '@/content/site'
import { useLenis } from '@/hooks/useLenis'
import { useScrolled } from '@/hooks/useScrolled'
import { cn } from '@/lib/cn'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * A main-nav link with the hover roll and an active state.
 *
 * @param {object} props
 * @param {import('@/content/site').NavItem} props.item
 * @param {() => void} [props.onClick] Called after navigating. Closes the overlay.
 * @param {string} [props.className] Extra classes.
 * @returns {JSX.Element}
 */
function NavItemLink({ item, onClick, className }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group inline-block transition-colors duration-(--duration-hover)',
          isActive ? 'text-primary' : 'text-secondary hover:text-primary',
          className,
        )
      }
    >
      {({ isActive }) => (
        <span className="relative block">
          <LabelRoll>{item.label}</LabelRoll>
          <span
            aria-hidden="true"
            className={cn(
              'absolute -bottom-1 left-0 h-px bg-signal transition-all duration-(--duration-hover)',
              isActive ? 'w-full' : 'w-0',
            )}
          />
        </span>
      )}
    </NavLink>
  )
}

/**
 * Site header.
 *
 * Transparent over the hero, gaining a hairline border and a blurred surface
 * after 64px of scroll. Below 768px the links move into a full-screen overlay
 * that traps focus, closes on Escape, restores focus to the toggle, and locks
 * the page behind it.
 *
 * `user` is always `null` today. It exists so that adding auth is a data change
 * rather than a redesign: when a session appears, the Contact pill gives way to
 * an account menu.
 *
 * @param {object} props
 * @param {import('@/lib/session').SessionUser | null} [props.user=null] Signed-in user.
 * @returns {JSX.Element}
 */
export function Nav({ user = null }) {
  const scrolled = useScrolled(64)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const lenis = useLenis()

  const overlayRef = useRef(/** @type {HTMLDivElement | null} */ (null))
  const toggleRef = useRef(/** @type {HTMLButtonElement | null} */ (null))

  /* A route change from inside the overlay should close it. */
  const [openAtPath, setOpenAtPath] = useState(location.pathname)
  if (open && openAtPath !== location.pathname) {
    setOpenAtPath(location.pathname)
    setOpen(false)
  }

  /* Lock the page behind the overlay. Lenis has to be stopped too, or it keeps
     scrolling the document underneath. */
  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    lenis?.stop()

    return () => {
      document.body.style.overflow = previousOverflow
      lenis?.start()
    }
  }, [open, lenis])

  /* Escape closes, Tab cycles inside. Focus moves to the first item on open and
     returns to the toggle on close. */
  useEffect(() => {
    if (!open) return undefined

    const overlay = overlayRef.current
    if (!overlay) return undefined

    /* Captured now: by cleanup time the overlay has gone and the ref may have
       moved on, so neither can be read then. */
    const previouslyFocused = document.activeElement
    const toggle = toggleRef.current
    const items = () => Array.from(overlay.querySelectorAll(FOCUSABLE))

    items()[0]?.focus()

    /** @param {KeyboardEvent} event */
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }

      if (event.key !== 'Tab') return

      const focusable = items()
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
      else toggle?.focus()
    }
  }, [open])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-(--duration-hover)',
        scrolled
          ? 'border-b border-hairline bg-surface/85 backdrop-blur-md'
          : 'border-b border-transparent',
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link
          to="/"
          className="group inline-flex items-center gap-3 font-mono text-sm tracking-(--text-label--letter-spacing) uppercase"
        >
          {/* Decorative next to the wordmark text, which already names the
              studio — an alt here would have a screen reader announce it twice. */}
          <img
            src={avatar}
            alt=""
            width="28"
            height="28"
            decoding="async"
            className="size-7 shrink-0 rounded-full object-cover"
          />
          <LabelRoll>{WORDMARK}</LabelRoll>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavItemLink key={item.to} item={item} className="text-base" />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            /* Placeholder. Phase 8 leaves the seam; there is no session yet. */
            <Button variant="outline" to="/account" className="hidden md:inline-flex">
              Account
            </Button>
          ) : (
            <Button
              to={NAV_CTA.to}
              variant="signal"
              className="hidden md:inline-flex"
            >
              {NAV_CTA.label}
            </Button>
          )}

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="inline-flex size-9 items-center justify-center rounded-(--radius-base) border border-hairline text-secondary transition-colors duration-(--duration-hover) hover:border-signal hover:text-primary md:hidden"
          >
            <span className="sr-only">Open the menu</span>
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
              <path d="M4 8h16M4 16h16" />
            </svg>
          </button>
        </div>
      </Container>

      {open ? (
        <div
          ref={overlayRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col bg-surface md:hidden"
        >
          <Container className="flex h-16 shrink-0 items-center justify-between">
            <span className="inline-flex items-center gap-1 font-mono text-sm tracking-(--text-label--letter-spacing) uppercase">
              <img
                src={avatar}
                alt=""
                width="28"
                height="28"
                decoding="async"
                className="size-7 shrink-0 rounded-full object-cover"
              />
              {WORDMARK}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-9 items-center justify-center rounded-(--radius-base) border border-hairline text-secondary transition-colors duration-(--duration-hover) hover:border-signal hover:text-primary"
            >
              <span className="sr-only">Close the menu</span>
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
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </Container>

          <Container className="flex flex-1 flex-col justify-center gap-8 pb-24">
            <nav aria-label="Main" className="flex flex-col gap-6">
              {NAV_ITEMS.map((item) => (
                <NavItemLink
                  key={item.to}
                  item={item}
                  onClick={() => setOpen(false)}
                  className="text-display-l font-display"
                />
              ))}
            </nav>
            <Button
              to={NAV_CTA.to}
              variant="signal"
              className="self-start"
              onClick={() => setOpen(false)}
            >
              {NAV_CTA.label}
            </Button>
          </Container>
        </div>
      ) : null}
    </header>
  )
}

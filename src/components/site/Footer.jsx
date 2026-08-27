import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { LabelRoll } from '@/components/motion/LabelRoll'
import { Container } from '@/components/primitives/Container'
import { BRAND_ICONS } from '@/components/site/brandIcons'
import {
  EMAIL,
  LOCATION,
  NAV_CTA,
  NAV_ITEMS,
  SOCIALS,
  STATEMENT,
  TIMEZONE,
  WORDMARK,
} from '@/content/site'

const CLOCK_INTERVAL = 20_000

const clockFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * The current time in Skopje, refreshed every 20 seconds.
 *
 * @returns {string} e.g. "14:32".
 */
function useSkopjeTime() {
  const [time, setTime] = useState(() => clockFormat.format(new Date()))

  useEffect(() => {
    const id = setInterval(
      () => setTime(clockFormat.format(new Date())),
      CLOCK_INTERVAL,
    )
    return () => clearInterval(id)
  }, [])

  return time
}

/**
 * One brand mark in a hairline square that fills with signal blue on hover,
 * knocking the icon out to white.
 *
 * @param {object} props
 * @param {import('@/content/site').SocialLink} props.social
 * @returns {JSX.Element}
 */
function SocialSquare({ social }) {
  const icon = BRAND_ICONS[social.icon]

  return (
    <a
      href={social.href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex size-11 items-center justify-center rounded-(--radius-base) border border-hairline text-secondary transition-colors duration-(--duration-hover) hover:border-signal hover:bg-signal hover:text-white"
    >
      <span className="sr-only">{social.label}</span>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d={icon.path} />
      </svg>
    </a>
  )
}

/**
 * Site footer, per §4.
 *
 * @returns {JSX.Element}
 */
export function Footer() {
  const time = useSkopjeTime()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-hairline">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-mono text-sm tracking-(--text-label--letter-spacing) uppercase">
              {WORDMARK}
            </p>
            <p className="mt-4 max-w-xs text-sm text-secondary">{STATEMENT}</p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-col gap-3">
              {[...NAV_ITEMS, NAV_CTA].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group inline-block text-secondary transition-colors duration-(--duration-hover) hover:text-primary"
                  >
                    <LabelRoll>{item.label}</LabelRoll>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:justify-self-end">
            <a
              href={`mailto:${EMAIL}`}
              className="group inline-block text-title text-link"
            >
              <LabelRoll>{EMAIL}</LabelRoll>
            </a>
            <ul className="mt-6 flex gap-3">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <SocialSquare social={social} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-hairline pt-6">
          <p className="mono-label">{LOCATION}</p>
          <p className="mono-label">
            <span className="sr-only">Local time in Skopje: </span>
            {time}
          </p>
          <p className="mono-label">
            © {year} {WORDMARK}
          </p>
        </div>
      </Container>
    </footer>
  )
}

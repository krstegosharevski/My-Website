import { Link, useLocation } from 'react-router-dom'

import { Seo } from '@/components/site/Seo'

/**
 * 404. Empty states invite an action, so this points at the work.
 *
 * `noindex` on the Seo tag, and the canonical path is whatever URL actually 404'd
 * rather than a fixed one — a search engine that already indexed a dead link
 * should learn that specific URL is gone, not be pointed at a generic page.
 *
 * @returns {JSX.Element}
 */
export function NotFound() {
  const { pathname } = useLocation()

  return (
    <div className="mx-auto max-w-site px-6 py-section">
      <Seo
        title="Page not found — Krtse XO"
        description="This page does not exist."
        path={pathname}
        noindex
      />
      <p className="mono-label">Error 404</p>
      <h1 className="mt-6 text-display-l">This page does not exist</h1>
      <p className="prose-measure mt-6 text-secondary">
        The link may be out of date, or the page may have moved. The work index
        is a good place to pick up from.
      </p>
      <Link
        to="/websites"
        className="mt-8 inline-block text-link underline underline-offset-4"
      >
        See the work
      </Link>
    </div>
  )
}

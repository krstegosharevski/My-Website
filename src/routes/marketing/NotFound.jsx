import { Link } from 'react-router-dom'

/**
 * 404. Empty states invite an action, so this points at the work.
 *
 * @returns {JSX.Element}
 */
export function NotFound() {
  return (
    <div className="mx-auto max-w-site px-6 py-section">
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

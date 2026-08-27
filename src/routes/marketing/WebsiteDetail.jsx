import { useParams } from 'react-router-dom'

/**
 * Case study. Gallery, lightbox and prev/next land in Phase 5.
 *
 * @returns {JSX.Element}
 */
export function WebsiteDetail() {
  const { slug } = useParams()

  return (
    <div className="mx-auto max-w-site px-6 py-section">
      <h1 className="text-display-xl">{slug}</h1>
    </div>
  )
}

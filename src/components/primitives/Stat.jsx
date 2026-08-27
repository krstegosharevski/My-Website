import { cn } from '@/lib/cn'

/**
 * A mono-labelled figure. Case studies use three of these for results.
 *
 * Rendered as a `<figure>` so the label reads as a caption rather than as a
 * heading, which keeps the page's heading order sequential.
 *
 * @param {object} props
 * @param {string} props.label What the figure measures.
 * @param {string} props.value The figure itself.
 * @param {string} [props.note] One short line of context under the value.
 * @param {string} [props.className] Extra classes.
 * @returns {JSX.Element}
 */
export function Stat({ label, value, note, className }) {
  return (
    <figure className={cn('border-t border-hairline pt-5', className)}>
      <figcaption className="mono-label">{label}</figcaption>
      <p className="mt-3 font-display text-display-l">{value}</p>
      {note ? <p className="mt-2 text-sm text-secondary">{note}</p> : null}
    </figure>
  )
}

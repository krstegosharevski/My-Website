import { cn } from '@/lib/cn'

/**
 * Mono label above a heading. Optionally paired with a section index.
 *
 * The index is only ever a real sequence position — never decoration. If a
 * group of things has no inherent order, leave it off.
 *
 * @param {object} props
 * @param {string} [props.index] Sequence position, e.g. "02".
 * @param {React.ElementType} [props.as='p'] Element to render.
 * @param {string} [props.className] Extra classes.
 * @param {React.ReactNode} props.children Label text.
 * @returns {JSX.Element}
 */
export function Eyebrow({ index, as: Tag = 'p', className, children }) {
  return (
    <Tag className={cn('mono-label flex items-center gap-3', className)}>
      {index ? (
        <>
          <span className="text-link">{index}</span>
          <span aria-hidden="true" className="h-px w-6 bg-hairline" />
        </>
      ) : null}
      <span>{children}</span>
    </Tag>
  )
}

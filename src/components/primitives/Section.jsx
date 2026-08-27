import { Container } from '@/components/primitives/Container'
import { Eyebrow } from '@/components/primitives/Eyebrow'
import { cn } from '@/lib/cn'

/**
 * A page section with the vertical rhythm from §3.4 and an optional mono
 * eyebrow and index.
 *
 * `divider` draws the single hairline that separates this section from the one
 * above it. One divider between sections, never two — so set it on the lower
 * section and leave the upper one alone.
 *
 * @param {object} props
 * @param {string} [props.eyebrow] Mono label above the section.
 * @param {string} [props.index] Sequence position for the eyebrow, e.g. "02".
 * @param {boolean} [props.divider=false] Draw a hairline along the top edge.
 * @param {boolean} [props.bleed=false] Skip the container, for full-width children.
 * @param {React.ElementType} [props.as='section'] Element to render.
 * @param {string} [props.className] Extra classes.
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export function Section({
  eyebrow,
  index,
  divider = false,
  bleed = false,
  as: Tag = 'section',
  className,
  children,
  ...rest
}) {
  const body = (
    <>
      {eyebrow ? (
        <Eyebrow index={index} className="mb-8">
          {eyebrow}
        </Eyebrow>
      ) : null}
      {children}
    </>
  )

  return (
    <Tag
      className={cn(
        'py-section',
        divider && 'border-t border-hairline',
        className,
      )}
      {...rest}
    >
      {bleed ? body : <Container>{body}</Container>}
    </Tag>
  )
}

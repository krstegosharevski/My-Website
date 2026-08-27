import { cn } from '@/lib/cn'

/**
 * Horizontal bounds for page content: 1200px, centred, with the gutter that
 * keeps text off the edge at 375px.
 *
 * @param {object} props
 * @param {React.ElementType} [props.as='div'] Element to render.
 * @param {string} [props.className] Extra classes.
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export function Container({ as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag className={cn('mx-auto w-full max-w-site px-6', className)} {...rest}>
      {children}
    </Tag>
  )
}

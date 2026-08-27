import { cn } from '@/lib/cn'

/**
 * One hairline rule. Between two sections there is exactly one of these —
 * `Section` can draw its own via the `divider` prop, so use this for dividers
 * inside a section rather than between them.
 *
 * @param {object} props
 * @param {string} [props.className] Extra classes.
 * @returns {JSX.Element}
 */
export function Divider({ className }) {
  return <hr className={cn('border-0 border-t border-hairline', className)} />
}

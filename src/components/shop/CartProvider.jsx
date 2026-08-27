import { CartContext, EMPTY_CART_CONTEXT } from '@/hooks/useCart'

/**
 * No-op cart. Renders its children behind a context carrying the eventual
 * shape from `useCart`, with every mutator doing nothing and the cart always
 * empty.
 *
 * Mounted in `App.jsx` so that building the shop later means replacing this
 * component's internals, not moving where it sits in the tree — nothing that
 * calls `useCart()` before then has to change when it stops being a no-op.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export function CartProvider({ children }) {
  return <CartContext value={EMPTY_CART_CONTEXT}>{children}</CartContext>
}

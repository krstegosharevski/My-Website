import { createContext, useContext } from 'react'

/**
 * @typedef {object} CartContextValue
 * @property {import('@/content/types').Cart} cart
 * @property {(productId: string, quantity?: number) => void} addItem
 * @property {(productId: string) => void} removeItem
 * @property {(productId: string, quantity: number) => void} setQuantity
 * @property {() => void} clear
 */

/**
 * No-op today — every mutator is a function that does nothing, and `cart` is
 * always empty. `CartProvider` passes this explicitly as its context value
 * rather than relying on `createContext`'s default (which only applies to a
 * consumer with no provider above it at all, and this app always has one).
 *
 * @type {CartContextValue}
 */
export const EMPTY_CART_CONTEXT = {
  cart: { items: [], subtotalCents: 0 },
  addItem: () => {},
  removeItem: () => {},
  setQuantity: () => {},
  clear: () => {},
}

/** @type {React.Context<CartContextValue>} */
export const CartContext = createContext(EMPTY_CART_CONTEXT)

/**
 * @returns {CartContextValue}
 */
export function useCart() {
  return useContext(CartContext)
}

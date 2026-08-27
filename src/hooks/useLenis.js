import { createContext, useContext } from 'react'

/**
 * Holds the Lenis instance created by `SmoothScroll`.
 *
 * The context and its hook live here rather than beside the provider so that
 * `SmoothScroll.jsx` exports a component and nothing else, which is what fast
 * refresh needs to hot-reload it.
 *
 * @type {React.Context<import('lenis').default | null>}
 */
export const LenisContext = createContext(null)

/**
 * The active Lenis instance, or `null` when smooth scroll is off — which is the
 * case under reduced motion, and before the provider has mounted. Callers must
 * handle `null` rather than assuming an instance exists.
 *
 * @returns {import('lenis').default | null}
 */
export function useLenis() {
  return useContext(LenisContext)
}

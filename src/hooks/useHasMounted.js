import { useSyncExternalStore } from 'react'

/** Never actually changes, so there is nothing to react to. */
function subscribe() {
  return () => {}
}

function getSnapshot() {
  return true
}

function getServerSnapshot() {
  return false
}

/**
 * `false` during any server render and on the client's first hydration pass,
 * `true` on every render after that.
 *
 * For gating content that depends on browser-only state a server can't know —
 * `prefers-reduced-motion`, `sessionStorage`, `matchMedia` — where rendering it
 * on the server's guess and then swapping it out on the client would itself be
 * the "broken intermediate state" reduced motion is supposed to prevent.
 *
 * `useSyncExternalStore` rather than a `useState` + `useEffect(() => setX(true), [])`
 * pair: the latter calls `setState` synchronously inside an effect, which
 * `react-hooks/set-state-in-effect` rejects in this codebase. This hook
 * produces the same two-pass behaviour — server/first-paint value, then the
 * real one — without an explicit `setState` call for the rule to flag.
 *
 * @returns {boolean}
 */
export function useHasMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

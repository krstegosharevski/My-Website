import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Subscribe to changes of the reduced-motion media query.
 *
 * @param {() => void} onChange
 * @returns {() => void} cleanup
 */
function subscribe(onChange) {
  const list = window.matchMedia(QUERY)
  list.addEventListener('change', onChange)
  return () => list.removeEventListener('change', onChange)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot() {
  return false
}

/**
 * The single source of truth for `prefers-reduced-motion` in this app.
 *
 * Every animated component reads this hook and renders its *final* state
 * immediately when it returns `true` — never a paused intermediate state and
 * never a half-drawn canvas. Do not re-implement the media query elsewhere.
 *
 * Reacts live to the setting changing, so toggling it in devtools works
 * without a reload.
 *
 * @returns {boolean} `true` when the visitor has asked for reduced motion.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

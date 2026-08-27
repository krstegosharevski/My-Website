import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'krtse-theme'

/**
 * @typedef {'light' | 'dark'} Theme
 */

/** Listeners for same-tab theme changes. `storage` only fires cross-tab. */
const listeners = new Set()

/**
 * Read the theme off the document element, which the inline script in
 * `index.html` has already set before first paint.
 *
 * @returns {Theme}
 */
function getSnapshot() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function getServerSnapshot() {
  return /** @type {Theme} */ ('light')
}

/**
 * @param {() => void} onChange
 * @returns {() => void} cleanup
 */
function subscribe(onChange) {
  listeners.add(onChange)
  window.addEventListener('storage', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onChange)
  }
}

/**
 * Apply a theme to the document and persist it.
 *
 * The `.dark` class on `<html>` is the single source of truth — the same thing
 * the inline script sets — so nothing can drift out of sync.
 *
 * @param {Theme} next
 */
function applyTheme(next) {
  document.documentElement.classList.toggle('dark', next === 'dark')
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* localStorage unavailable — the theme still applies for this page view */
  }
  listeners.forEach((listener) => listener())
}

/**
 * Class-based light/dark theme, persisted to localStorage. Light "paper" is the
 * default; the inline script in `index.html` applies a stored choice before the
 * first paint so there is no flash.
 *
 * @returns {{ theme: Theme, setTheme: (next: Theme) => void, toggleTheme: () => void }}
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setTheme = useCallback((next) => applyTheme(next), [])
  const toggleTheme = useCallback(
    () => applyTheme(getSnapshot() === 'dark' ? 'light' : 'dark'),
    [],
  )

  return { theme, setTheme, toggleTheme }
}

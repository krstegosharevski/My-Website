import { useEffect, useState } from 'react'

/**
 * Whether the page has scrolled past a threshold.
 *
 * Lenis scrolls the real document, so the native scroll event is the right
 * signal and stays correct when smooth scroll is off under reduced motion.
 * The listener is passive and removed on unmount.
 *
 * @param {number} [threshold=64] Distance in pixels.
 * @returns {boolean}
 */
export function useScrolled(threshold = 64) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function read() {
      setScrolled(window.scrollY > threshold)
    }

    /* The browser can restore a scroll position before this mounts. */
    read()

    window.addEventListener('scroll', read, { passive: true })
    return () => window.removeEventListener('scroll', read)
  }, [threshold])

  return scrolled
}

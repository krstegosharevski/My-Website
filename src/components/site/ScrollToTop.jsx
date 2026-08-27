import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { useLenis } from '@/hooks/useLenis'

/**
 * Resets scroll to the top when the path changes.
 *
 * A router navigation is not a browser navigation, so nothing resets the scroll
 * position on its own — without this, following a link from halfway down the
 * work index lands halfway down the case study.
 *
 * The jump is immediate rather than smooth: an 800px animated scroll on top of
 * a route fade reads as a glitch. When Lenis is running it has to do the reset
 * itself, since it owns the scroll position.
 *
 * A hash link is left alone, so in-page anchors still work.
 *
 * @returns {null}
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const lenis = useLenis()

  useEffect(() => {
    if (hash) return

    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname, hash, lenis])

  return null
}

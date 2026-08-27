import { motion } from 'motion/react'
import { Outlet, useLocation } from 'react-router-dom'

import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { Footer } from '@/components/site/Footer'
import { Nav } from '@/components/site/Nav'
import { ScrollToTop } from '@/components/site/ScrollToTop'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { getCurrentUser } from '@/lib/session'

/** §3.5.8: 250ms fade with a 6px rise on the incoming route. */
const FADE_DURATION = 0.25
const FADE_RISE = 6

/**
 * Chrome shared by every marketing route: smooth scroll, the fixed header, the
 * routed page, and the footer.
 *
 * The `pt-16` on the main element clears the fixed header. The header is
 * transparent over the hero, so a page can still start at the top of the
 * viewport by pulling its first section up.
 *
 * `Nav` reads its `user` prop from `getCurrentUser()` — always `null` today,
 * since no auth provider is installed. Wiring a real session means changing
 * what that function returns, not touching this layout.
 *
 * @returns {JSX.Element}
 */
export function MarketingLayout() {
  const location = useLocation()
  const reducedMotion = useReducedMotion()
  const user = getCurrentUser()

  return (
    <SmoothScroll>
      <ScrollToTop />
      <div className="flex min-h-dvh flex-col">
        <Nav user={user} />
        <main id="main" className="flex-1 pt-16">
          {reducedMotion ? (
            <Outlet />
          ) : (
            /* Keyed on the path so the incoming route mounts fresh and fades.
               There is no exit animation: holding the old page while the new one
               waits makes every navigation feel slower than it is. */
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: FADE_RISE }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: FADE_DURATION, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          )}
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  )
}

import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { CartProvider } from '@/components/shop/CartProvider'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { About } from '@/routes/marketing/About'
import { Contact } from '@/routes/marketing/Contact'
import { Home } from '@/routes/marketing/Home'
import { NotFound } from '@/routes/marketing/NotFound'
import { WebsiteDetail } from '@/routes/marketing/WebsiteDetail'
import { Websites } from '@/routes/marketing/Websites'

/* Dev reference page. Lazy so it never lands in the bundle a visitor downloads. */
const Styleguide = lazy(() =>
  import('@/routes/marketing/Styleguide').then((m) => ({
    default: m.Styleguide,
  })),
)

/**
 * Route configuration.
 *
 * The five marketing routes and the 404 sit inside `MarketingLayout`, which
 * fills the shell with the nav, footer and smooth scroll. `/styleguide` is
 * deliberately outside that chrome.
 *
 * `CartProvider` wraps the whole router. It is a no-op today — see
 * `src/components/shop/CartProvider.jsx` — but it sits here now so building
 * the shop later means changing what the provider does, not where the app
 * mounts it or which pages can reach `useCart()`.
 *
 * @returns {JSX.Element}
 */
export function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/websites" element={<Websites />} />
            <Route path="/websites/:slug" element={<WebsiteDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            {/* An explicit path so an unknown case-study slug has somewhere
                real to redirect to, rather than relying on the catch-all. */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route
            path="/styleguide"
            element={
              <Suspense fallback={null}>
                <Styleguide />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

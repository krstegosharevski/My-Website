import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

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
 * Phase 3 fills with the nav, footer and smooth scroll. `/styleguide` is
 * deliberately outside that chrome.
 *
 * @returns {JSX.Element}
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/websites" element={<Websites />} />
          <Route path="/websites/:slug" element={<WebsiteDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
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
  )
}

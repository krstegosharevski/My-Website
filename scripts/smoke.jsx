/* Temporary render smoke test. Not part of the app; deleted after running.
   Server-renders each route so import mistakes, bad element types and throwing
   render paths surface without a browser. Effects do not run, so canvas and
   listener code is out of scope here. */
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { MarketingLayout } from '@/layouts/MarketingLayout'
import { About } from '@/routes/marketing/About'
import { Contact } from '@/routes/marketing/Contact'
import { Home } from '@/routes/marketing/Home'
import { NotFound } from '@/routes/marketing/NotFound'
import { Styleguide } from '@/routes/marketing/Styleguide'
import { WebsiteDetail } from '@/routes/marketing/WebsiteDetail'
import { Websites } from '@/routes/marketing/Websites'

const ROUTES = [
  '/',
  '/websites',
  '/websites/freight-invoice-portal',
  '/websites/does-not-exist',
  '/about',
  '/contact',
  '/nope',
  '/styleguide',
]

let failed = 0

for (const path of ROUTES) {
  try {
    const html = renderToString(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/websites" element={<Websites />} />
            <Route path="/websites/:slug" element={<WebsiteDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/styleguide" element={<Styleguide />} />
        </Routes>
      </MemoryRouter>,
    )
    console.log(`  ok    ${path.padEnd(34)} ${html.length} chars`)
  } catch (error) {
    failed += 1
    console.log(`  FAIL  ${path}`)
    console.log(`        ${error.message}`)
  }
}

console.log(failed === 0 ? '\nall routes rendered' : `\n${failed} route(s) failed`)
process.exit(failed === 0 ? 0 : 1)

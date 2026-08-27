#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from the static routes and the case studies in
 * src/content/projects.js.
 *
 * Run via `npm run build` (wired in as a `prebuild` step) or directly with
 * `node scripts/build-sitemap.js`. Writing into `public/` means Vite copies the
 * file into `dist/` unchanged during the actual build.
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { PROJECTS } from '../src/content/projects.js'
import { SITE_URL } from '../src/lib/seo.js'

const today = new Date().toISOString().slice(0, 10)

/**
 * @typedef {object} SitemapEntry
 * @property {string} path
 * @property {'weekly' | 'monthly' | 'yearly'} changefreq
 * @property {number} priority 0–1.
 */

/** @type {SitemapEntry[]} */
const STATIC_ROUTES = [
  { path: '/', changefreq: 'monthly', priority: 1.0 },
  { path: '/websites', changefreq: 'weekly', priority: 0.9 },
  { path: '/about', changefreq: 'monthly', priority: 0.6 },
  { path: '/contact', changefreq: 'monthly', priority: 0.6 },
]

/** @type {SitemapEntry[]} */
const PROJECT_ROUTES = PROJECTS.map((project) => ({
  path: `/websites/${project.slug}`,
  changefreq: 'monthly',
  priority: 0.8,
}))

const ENTRIES = [...STATIC_ROUTES, ...PROJECT_ROUTES]

/**
 * @param {SitemapEntry} entry
 * @returns {string}
 */
function urlTag({ path, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${SITE_URL}${path}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority.toFixed(1)}</priority>`,
    '  </url>',
  ].join('\n')
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ENTRIES.map(urlTag).join('\n')}
</urlset>
`

const outPath = fileURLToPath(new URL('../public/sitemap.xml', import.meta.url))
writeFileSync(outPath, xml)

console.log(`sitemap.xml written with ${ENTRIES.length} URLs`)

if (SITE_URL.includes('TODO')) {
  console.warn(
    'warning: SITE_URL in src/lib/seo.js is still the placeholder domain — the sitemap URLs are not real yet.',
  )
}

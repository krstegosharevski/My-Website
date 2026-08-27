/**
 * Site-wide SEO constants shared between `index.html`, the `Seo` component and
 * the sitemap script. Kept out of `content/site.js` because these describe the
 * site to machines rather than to a visitor.
 */

/** No trailing slash. TODO: replace with the real production domain. */
export const SITE_URL = 'https://TODO-krtse-xo.example.com'

export const SITE_NAME = 'Krtse XO'

export const DEFAULT_TITLE = 'Krtse XO — websites and the systems behind them'

export const DEFAULT_DESCRIPTION =
  'A one-person studio in Skopje building business websites, customer portals, and the integrations behind them.'

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.png`

/**
 * Join a path onto the site origin.
 *
 * @param {string} path Starting with "/".
 * @returns {string}
 */
export function absoluteUrl(path) {
  return `${SITE_URL}${path}`
}

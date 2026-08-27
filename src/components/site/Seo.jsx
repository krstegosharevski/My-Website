import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_NAME,
} from '@/lib/seo'

/**
 * Per-route metadata.
 *
 * React 19 hoists `<title>`, `<meta>` and `<link>` rendered anywhere in the
 * tree into `<head>` — that is the whole mechanism here, no helmet library
 * needed. Render one of these per route, as early in its markup as convenient.
 *
 * The site-level tags in `index.html` are the fallback social scrapers see: an
 * SPA ships one HTML file, so a scraper that does not execute JavaScript reads
 * whatever `index.html` says regardless of what this component renders. These
 * per-route tags are for scrapers and crawlers that do run JavaScript, and for
 * setting the document title correctly for every visitor. See
 * `docs/prerendering.md` for what fixes this properly.
 *
 * @param {object} props
 * @param {string} props.title Page title. Site name is not appended automatically.
 * @param {string} [props.description]
 * @param {string} props.path Route path starting with "/", for the canonical URL.
 * @param {string} [props.image] Absolute URL. Falls back to the site default.
 * @param {'website' | 'article'} [props.type='website']
 * @param {boolean} [props.noindex=false] For the 404 route.
 * @returns {JSX.Element}
 */
export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
}) {
  const url = absoluteUrl(path)

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  )
}

Seo.defaultTitle = DEFAULT_TITLE

# Raster exports still needed

This build environment had no way to rasterize SVG to PNG — no `sharp`, no
`rsvg-convert`/Inkscape, no headless browser. Everything that needed a PNG was
instead built as a complete SVG source and left referenced-but-missing rather
than faked. `npm run build` and the site work fine without them (browsers fall
back to `favicon.svg`), but do this before deploying — a few platforms
(notably iOS home-screen icons, and some social scrapers for `og:image`) need
an actual raster file.

| Missing file | Source | Size |
|---|---|---|
| `public/og/default.png` | `public/og/default.svg` | 1200×630 |
| `public/favicon-32.png` | `public/favicon.svg` | 32×32 |
| `public/apple-touch-icon.png` | `public/favicon.svg` | 180×180, no transparency (iOS ignores alpha) |
| `public/icon-192.png` | `public/favicon.svg` | 192×192, referenced by `site.webmanifest` |
| `public/icon-512.png` | `public/favicon.svg` | 512×512, referenced by `site.webmanifest` |

Any of these work:

- Open the SVG in a browser and screenshot it at the target size.
- Inkscape, `resvg`, or an online SVG-to-PNG converter.
- Figma or other design software: paste the SVG, export as PNG.

Delete this file once all five exist.

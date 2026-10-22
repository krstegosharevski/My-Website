# Raster exports still needed

One file is still missing:

| Missing file | Source | Size |
|---|---|---|
| `public/og/default.png` | `public/og/default.svg` | 1200×630 |

`index.html` already points `og:image` and `twitter:image` at
`/og/default.png`, so until this file exists, link previews on LinkedIn,
WhatsApp, Slack and similar show no image. Most social scrapers do not accept
SVG, which is why the `.svg` source alone is not enough.

Any of these work:

- Open the SVG in a browser and screenshot it at 1200×630.
- Inkscape, `resvg`, or an online SVG-to-PNG converter.
- Figma or other design software: paste the SVG, export as PNG.

Delete this file once it exists.

## Already done

The logo icons (`favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`,
`icon-512.png`) are rendered from `public/logo.svg`. If you change the logo,
re-render all four from that file at those sizes — `apple-touch-icon.png` on a
white background with no transparency, since iOS ignores alpha.

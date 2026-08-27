# Krtse XO

The site for Krtse XO, a one-person studio in Skopje building business
websites, customer portals, and the integrations behind them.

Project rules live in [`CLAUDE.md`](./CLAUDE.md); design and phase decisions
live in [`krtse-xo-build-plan.md`](./krtse-xo-build-plan.md). Read those before
changing anything — this file is setup and deploy, not design.

## Stack

React 19 · Vite · JavaScript (no TypeScript) · ESLint · Tailwind v4 ·
`motion` · Lenis · `react-router-dom` v7. Fonts self-hosted via
`@fontsource-variable/*`. Deployed on Vercel.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in VITE_WEB3FORMS_KEY
npm run dev
```

The contact form works without the key — it falls back to a `mailto:` link —
so this step can be skipped for local UI work.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Local dev server. |
| `npm run build` | Regenerates `public/sitemap.xml`, then builds to `dist/`. |
| `npm run preview` | Serves the production build locally. |
| `npm run lint` | ESLint. Must pass clean before any commit. |
| `npm run smoke` | Server-renders every route to catch import mistakes and throwing render paths without a browser. |
| `npm run sitemap` | Regenerates `public/sitemap.xml` on its own. |

Also useful, outside `npm run`:

- `/styleguide` — every colour token, the type scale, and a live example of
  every primitive and motion component. Not linked from the site; open it
  directly. Set `noindex` and excluded in `robots.txt`.

## Before deploying

A few things this repo intentionally leaves undone, listed with why:

- **`src/content/site.js`** — `EMAIL` and every URL in `SOCIALS` are
  placeholder values (`TODO@example.com`, `.../TODO`), deliberately obvious
  rather than plausible so nothing fake reaches production unnoticed. Replace
  them.
- **`src/content/projects.js`** — four scaffold case studies with invented
  figures and generated placeholder images under `public/work/`. Every client
  is `anonymized: true` and described rather than named. Replace with real
  work — §9 of the build plan is the content checklist.
- **`src/content/about.js`** and **`src/content/process.js`** — bio and the
  four process steps are placeholder copy in the right register, marked
  `TODO` in the files themselves.
- **`src/lib/seo.js`** — `SITE_URL` is a placeholder domain, also repeated as a
  literal in `index.html` (which cannot import JS) and in `public/robots.txt`.
  `npm run build` warns if it's still a placeholder when the sitemap is
  generated. Update all three together.
- **`docs/needs-export.md`** — five PNGs (the OG image, favicons, manifest
  icons) exist only as SVG source because no rasterizer was available in the
  environment this was built in. The site works without them; a few platforms
  (iOS home-screen icons, some social scrapers) need the real files. Lists
  exactly what's missing and how to produce it.
- **`.env.local`** — set `VITE_WEB3FORMS_KEY` from [web3forms.com](https://web3forms.com).

## Deploying

Connect the repository in Vercel; the default Vite build settings work
unchanged. Set `VITE_WEB3FORMS_KEY` as an environment variable in the Vercel
project settings — do not commit it.

**`vercel.json`'s rewrite is not optional.** This is a client-only SPA — one
`index.html`, routing handled by `react-router-dom` in the browser. Without
the rewrite, a direct hit or a page refresh on `/websites/some-slug` 404s at
the host, because there is no actual file at that path. Vercel checks the
filesystem and any `api/` serverless function before applying a rewrite, so
this catch-all does not interfere with `api/` once something is deployed
there.

After deploying, test by opening a deep link directly (not by navigating from
the home page) and refreshing it.

## What's deliberately not here yet

- **No server**, beyond the empty `api/` folder reserved for Vercel
  serverless functions. Every `VITE_*` variable compiles into the client
  bundle — see `api/README.md` for what that means for secrets.
- **No auth provider, no Stripe.** `src/lib/session.js`,
  `src/components/shop/CartProvider.jsx` and `src/components/site/ProtectedRoute.jsx`
  are seams for both, not implementations. `docs/shop-architecture.md` lays
  out the two paths for the shop when that phase starts.
- **No prerendering**, so link previews are site-level rather than per-page —
  `docs/prerendering.md` documents the `vite-react-ssg` migration for when
  there are real case studies worth sharing by link.

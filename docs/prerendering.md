# Adding prerendering with `vite-react-ssg`

Where this project stands today: a client-only SPA. `index.html` ships with one
site-wide title, description and `og:image`. The `Seo` component
(`src/components/site/Seo.jsx`) sets a real per-route `<title>` after React
mounts, so a crawler that executes JavaScript — Googlebot, and most AI
assistants that browse — sees correct per-page metadata. A social scraper that
does not execute JavaScript — Slack, WhatsApp, iMessage, most of them — reads
only `index.html`, so every link to this site currently previews with the same
title and image regardless of which page was shared.

`vite-react-ssg` fixes that by generating real static HTML per route at build
time, with each route's `Seo` tags already baked in. Do this once there are
real case studies worth sharing by link — see §8 of the build plan.

**Do not install it yet.** It is reserved, per `CLAUDE.md`.

## What changes

1. **`npm i -D vite-react-ssg`** (also confirm `react-dom` stays a peer, not a
   duplicate — the package expects your existing React).

2. **`src/main.jsx`** currently calls `createRoot(...).render(...)` directly.
   `vite-react-ssg` replaces that entry point with its own `ViteReactSSG`
   export, which needs the route tree as data rather than as JSX rendered
   inside a `<BrowserRouter>`. That means:

   - **`src/App.jsx`** changes from a component that renders `<BrowserRouter>`
     with `<Routes>`/`<Route>` children into a plain route config object (the
     shape `vite-react-ssg` expects, similar to `react-router`'s
     `createBrowserRouter` array). The route elements — `MarketingLayout`,
     `Home`, `Websites`, `WebsiteDetail`, etc. — do not change; only how they
     are wired together does.
   - **`src/main.jsx`** exports the `ViteReactSSG(routes, ...)` call instead of
     calling `createRoot` itself. The library handles both the client
     hydration entry and the Node-side static render.

3. **Dynamic routes need their params enumerated at build time.**
   `/websites/:slug` currently resolves client-side from `useParams()`.
   `vite-react-ssg` needs a list of every slug to prerender —
   `getStaticPaths` (or the equivalent config key; check the version's docs)
   reading `PROJECTS` from `src/content/projects.js` and returning
   `/websites/${project.slug}` for each. Miss a slug here and that one case
   study stays client-rendered only — it still works, it just does not get a
   correct preview.

4. **`vite.config.js`** gets the `vite-react-ssg` plugin/config block per its
   docs — typically a `ssgOptions` key (output dir, script mode) alongside the
   existing `react()` and `tailwindcss()` plugins already there.

5. **`WaterField`, `SmoothScroll`, and anything else that touches
   `window`/`document` in a `useEffect`** are already effect-gated, so they are
   safe under SSG as written — effects do not run during the Node-side render,
   only after hydration in the browser. Nothing in this codebase reads
   `window` outside an effect, so no guards should be needed. Worth
   double-checking `useTheme.js` and `useReducedMotion.js` specifically, since
   they read `window.matchMedia`/`localStorage` — both already do this inside
   `useSyncExternalStore`'s `getSnapshot`, with a `getServerSnapshot` fallback,
   which is exactly the pattern SSG frameworks expect.

6. **`index.html`'s inline no-flash theme script** stays. It still runs before
   hydration in the browser; it has nothing to do during the Node-side
   prerender.

7. **`package.json`**: `"build"` changes from `vite build` to whatever
   `vite-react-ssg` documents as its build command (commonly `vite-react-ssg
   build`, run after the existing `node scripts/build-sitemap.js` step —
   `sitemap.xml` generation does not depend on SSG and stays as-is).

8. **`vercel.json`'s SPA rewrite** (Phase 9) can likely be narrowed once every
   route has real static HTML, since a direct hit on `/websites/some-slug`
   would no longer need to fall through to `index.html` — but verify this
   against whatever `vite-react-ssg` actually emits (a per-route
   `index.html` under a matching folder) before removing the rewrite outright.
   Vercel's static file serving may already resolve `/websites/some-slug/`
   correctly with trailing-slash routes; test on a preview deploy before
   trusting it.

## What does not change

The design system, the motion, the water, the component tree, the content
files, the route structure. This is a build-output change, not a rewrite.

## Verifying it worked

After deploying, paste a case-study URL into a link-preview validator (Meta's
Sharing Debugger, or Twitter/X's Card Validator) and confirm the title, image
and description shown are that specific project's, not the site-wide default
from `index.html`.

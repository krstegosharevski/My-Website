# CLAUDE.md — Krtse XO

Project rules. Read this and `krtse-xo-build-plan.md` before any work. The plan owns design decisions; this file owns how code is written here.

## What this project is

The site for Krtse XO, a one-person studio in Skopje building business websites, customer portals, and the integrations behind them. It has to convince a decision-maker in 30 seconds and give them a way to make contact. A shop and user accounts come later — the structure assumes that from day one.

## Stack

**Vite · React 19 · JavaScript · ESLint · Tailwind v4 · `motion` · Lenis · `react-router-dom` v7.**
Fonts self-hosted via `@fontsource-variable/*`. Deployed on Vercel.

This is **JavaScript, not TypeScript**. Do not add TypeScript, do not create `.ts`/`.tsx` files, do not add a `tsconfig.json`. Type information goes in JSDoc blocks.

Reserved and **not to be installed until their phase**: Stripe, any auth provider, `vite-react-ssg`.

## Hard constraints of this stack

- **There is no server.** No API routes, no server components, no `getServerSideProps`. Anything needing a secret goes in the root `api/` folder as a Vercel serverless function, and only in the phase that calls for it.
- **Every `VITE_*` variable is public.** Vite compiles them into the client bundle that visitors download. Never put a secret key, a database URL, or a Stripe secret in one. If a value must stay private, it does not belong in `src/`.
- **Deep links need the SPA rewrite** in `vercel.json`, or `/websites/some-slug` 404s on refresh.
- **Link previews are site-level, not per-route**, until prerendering is added. Don't claim otherwise in a commit message or README.

## Architecture rules

- **Route folders are fixed:** `routes/marketing`, `routes/shop`, `routes/auth`, `routes/account`. Never add a route file outside one.
- **`src/` may never import from `api/`.** Enforced by an ESLint rule.
- **`Nav` always accepts an optional `user` prop.** Adding auth is a data change, not a redesign.
- **Content lives in `src/content/*.js`**, never inline in a component.
- **Imports use the `@/` alias**, not long relative chains.
- **No new dependency without asking.** The installed set is deliberate.

## Design non-negotiables

- **Tailwind v4 only.** Config lives in `@theme` in `src/styles/globals.css`. Never create `tailwind.config.js`. No `@apply` outside that file.
- **Tokens only.** No arbitrary hex in components. `--signal` never carries body-size text — small blue text uses the theme's `--text-link`.
- **Light paper is the default theme.** Dark is fully supported, not an afterthought.
- **Three typefaces, three roles.** `'Newsreader Variable'` for h1/h2 only. `'Geist Variable'` for body and UI. `'Geist Mono Variable'` for eyebrows, labels, indices, chips, metadata.
- **Radius is 4px**, except the primary button, which is a pill.
- **`motion` imports come from `motion/react`**, not `framer-motion`.
- **One `useReducedMotion` hook**, read by every animated component. Reduced motion renders the final state instantly — never a broken intermediate one, never a half-drawn canvas.

## Motion rules

Masked line rise on h1 and h2 only. Quiet opacity-and-rise on everything else. Clip-path wipe on images, never a plain fade. Hover label roll on buttons and nav links. One pinned section on the home page, desktop only. The water field is ambient and must never compete with a foreground animation in the same viewport.

## React conventions

- `PascalCase.jsx`, one component per file, named exports.
- Props documented with a JSDoc `@param` block. No PropTypes.
- Every `useEffect` that adds a listener, timer, observer or animation frame **returns a cleanup function**. Canvas loops cancel their `requestAnimationFrame` on unmount.
- No state in a component that could be derived during render.
- Images are plain `<img>` with explicit `width` and `height`, `loading="lazy"` (except an above-the-fold hero image), and `decoding="async"`.
- Class merging via `cn()` in `src/lib/cn.js`.

## Copy rules

Sentence case everywhere, including headings and buttons. Short declarative sentences. No superlatives, no "cutting-edge", "seamless", "solutions", "crafted", no exclamation marks. First person for the studio, second person for the reader. Buttons name the outcome — "Send message", not "Submit" — and the same word carries through the flow. Errors say what went wrong and how to fix it, without apologizing. Empty states invite an action.

## Banned patterns

Gradient backgrounds as decoration · glassmorphism · glowing orbs · emoji as icons · icon-in-a-circle grids · parallax · custom cursors · scroll-jacking · letter-by-letter heading animation · Title Case · lorem ipsum in committed code · stock photography · fabricated testimonials · numbering anything that isn't a real sequence.

If a request seems to call for one of these, say so and propose the alternative from §3 of the plan.

## Quality floor — every phase, not just the audit

Works down to 375px · visible signal-blue keyboard focus on every interactive element · sequential heading order · alt text on every image · reduced motion respected · no layout shift · every effect cleaned up · `npm run build` and `npm run lint` both pass clean.

## Workflow

One phase per session from the plan. Commit at the end of each, message naming the phase. Before calling a visual phase done, compare the output against §3 of the plan and report anything that drifted.

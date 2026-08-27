# api/

Empty until Phase 8's shop and auth work actually lands — this folder exists so
the location is decided, not so anything runs here yet.

## What this is

Vercel deploys any file placed here (`.js`, `.ts`, etc.) as a serverless
function automatically, alongside the static Vite build — no extra
configuration needed. `api/example.js` becomes reachable at `/api/example`.

## Why it exists

**There is no server for the rest of this app.** `src/` is a client-only Vite
SPA — every `VITE_*` environment variable it uses gets compiled straight into
the JavaScript bundle visitors download. That is fine for a Web3Forms public
access key (Phase 6); it is never fine for a Stripe secret key, a database
connection string, a webhook signing secret, or anything else that must stay
private.

**This folder is the only place in the repository a secret may live.** A
serverless function here runs server-side, so it can read a non-`VITE_`
environment variable (set in the Vercel dashboard, not committed) without
exposing it to the browser.

## Rule

`src/` may never import from `api/`. An ESLint rule enforces this — see
`eslint.config.js`. The two run in different environments (browser vs. Node)
and are deployed differently; an import across that boundary is always a
mistake, not a shortcut.

See `docs/shop-architecture.md` for the two paths this folder could take once
the shop actually gets built.

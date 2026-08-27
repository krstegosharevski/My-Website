# Shop architecture — two viable paths

Not decided yet. Both are compatible with everything built so far — the seams
in `src/content/types.js` (`Product`, `CartItem`, `Cart`, `Order`, `OrderItem`),
`CartProvider`, and `src/lib/session.js` don't commit to either.

The one constraint that holds regardless of which path is chosen: **the Stripe
secret key and the webhook signing secret live server-side only, never in a
`VITE_*` variable.** Vite compiles every `VITE_*` variable into the client
bundle a visitor downloads — there is no way to keep one of those private. See
`api/README.md`.

## Path A — backend-as-a-service

A hosted platform (Supabase, Firebase, and similar) handles auth, the database
and often payments directly from the browser, using a public anon/publishable
key the same way Web3Forms's key works today.

**Trade-offs:**

- Fastest to stand up — no server code to write for CRUD, and auth is mostly
  configuration.
- Row-level security policies do the work `api/` functions would otherwise do
  by hand — but they have to be gotten right, and a mistake there is a data
  leak, not a crash.
- The Stripe secret key still cannot go client-side. Most BaaS platforms
  support a serverless/edge function layer of their own for exactly this
  (Supabase Edge Functions, Firebase Cloud Functions) — so this path still ends
  up with *some* server-side code for checkout, just not necessarily in this
  repo's `api/` folder.
- Vendor lock-in is real, and cuts against the "Owned" pillar on the home page
  (§6.1) — a client should be able to take their site elsewhere.

## Path B — serverless functions in `api/` with a hosted database

`api/` functions handle checkout, webhooks and any write that needs a secret;
a hosted Postgres (Neon, Supabase-as-database-only, Vercel Postgres) holds the
data; auth is a small provider (Lucia, Auth.js, or similar) rather than a full
BaaS.

**Trade-offs:**

- More code to write up front — there is no auto-generated CRUD layer.
- Everything sensitive is explicit and in one place (`api/`), which matches
  the constraint this repo already enforces with the ESLint import rule.
- No platform lock-in beyond "a Postgres database" and "Vercel functions," both
  fairly portable.
- Scales down to almost nothing at low traffic (Vercel's function pricing),
  and the mental model is the same `fetch()` a Web3Forms integration already
  uses, just pointed at `/api/...` instead of an external host.

## Either way

- Stripe's checkout session (or payment intent) is created by an `api/`
  function, never client-side, so the amount charged cannot be tampered with
  in the browser before it reaches Stripe.
- The webhook that confirms payment and marks an `Order` as `paid` is an `api/`
  function verifying Stripe's signature with the signing secret — never trust
  a client-side "payment succeeded" callback alone to fulfil an order.
- `CartItem.priceCents` and `OrderItem.priceCents` are captured at add-time and
  order-time respectively (see the JSDoc in `src/content/types.js`) specifically
  so a later price change cannot rewrite what a customer already agreed to pay.

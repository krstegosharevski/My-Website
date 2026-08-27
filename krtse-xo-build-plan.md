# Krtse XO — Build Plan v3 (Vite + React + JavaScript)

Rewritten for the project you scaffolded: **Vite · React · JavaScript · ESLint**.

Run the phases in order with Claude Code, one phase per session, commit at the end of each.

---

## 1. What changed from v2, and what it costs

v2 assumed Next.js. You're on Vite, which is a client-only single-page app with no server. Most of the plan survives unchanged — the design system, the motion, the water, the components. Four things genuinely change, and one of them has a real cost you should know about now rather than in month three.

| Area | v2 (Next.js) | v3 (Vite) |
|---|---|---|
| Routing | App Router folders | `react-router-dom` v7, route config in `App.jsx` |
| Types | TypeScript | JSDoc `@typedef` blocks — real editor autocomplete, no build step |
| Fonts | `next/font` | `@fontsource-variable/*`, self-hosted |
| Images | `next/image` | plain `<img>` with explicit `width`/`height` and `loading="lazy"` |
| Metadata | `generateMetadata` | React 19 hoists `<title>`/`<meta>` rendered in components — no helmet library needed |
| Server work | route handlers | none — see below |

**The cost, stated plainly.** A Vite SPA ships one nearly-empty `index.html` and builds the page in the browser. Google executes JavaScript and will index you fine. **Social scrapers do not.** When you paste a case-study link into LinkedIn or WhatsApp, the preview will show your site-wide title and image, not that project's. For a portfolio you'll share by link, that matters.

Three ways to handle it, in order of effort:

1. **Accept it for now.** Put strong site-level OG tags in `index.html`. Every link preview looks identical but correct. Fine for launch.
2. **Prerender at build time** with `vite-react-ssg`. Generates real static HTML per route, keeps everything else about your setup. This is the recommended fix once you have real case studies — Phase 7 has the notes.
3. **Move to Next.js later.** Not needed. Option 2 solves it.

**The other consequence: no server means no place to keep a secret.** Every `VITE_*` variable is compiled into the JavaScript your visitors download. This is fine for the site, and it's a hard constraint for Phase 8 — a Stripe secret key can never live in this codebase. The shop phase uses serverless functions in a root `api/` folder (Vercel picks them up automatically alongside a Vite build) or a backend-as-a-service. Both paths are documented in Phase 8.

Everything from §3 onward in v2 — colors, type, copy register, motion, water, anti-patterns — carries over unchanged and is restated below.

---

## 2. Stack

React 19 · Vite · JavaScript · ESLint · Tailwind v4 (via `@tailwindcss/vite`) · `motion` · Lenis · `react-router-dom` v7 · self-hosted Newsreader + Geist + Geist Mono · deployed on Vercel.

**Install in Phase 0:**

```bash
npm i react-router-dom motion lenis clsx tailwind-merge
npm i @fontsource-variable/newsreader @fontsource-variable/geist @fontsource-variable/geist-mono
npm i -D tailwindcss @tailwindcss/vite
```

CSS family names, exactly: `'Newsreader Variable'`, `'Geist Variable'`, `'Geist Mono Variable'`.

**Reserved for the shop phase, do not install yet:** Stripe, and whichever auth provider you pick.

---

## 3. Design direction

### 3.1 Color

```
--signal        #1F5EFF   the blue: fills, active states, focus rings, water tint
--signal-lo     #8FB4FF   blue for small text on dark
--signal-ink    #1A4FD6   blue for small text on paper

light (default)              dark
base      #FAF9F6            #0B0D10
raised    #FFFFFF            #14171C
hairline  #E5E2DC            #1F242C
text      #14161A            #F4F6F8
muted     #5C6672            #8A93A0
```

The paper white is warmed slightly (#FAF9F6, not #FFFFFF) — that's what stops a light editorial page from reading as a blank document.

**Rule:** `--signal` never carries body-size text. Small blue text uses the theme's `--text-link`, which resolves to `--signal-ink` on paper and `--signal-lo` on dark.

### 3.2 Typography

- **Display — Newsreader Variable.** Warm transitional serif. h1 and h2 only, weight 450, `font-variation-settings: "opsz" 40`, tracking `-0.02em`.
- **Body — Geist Variable.** `1.125rem`, line-height `1.65`, measure capped at `70ch`.
- **Utility — Geist Mono Variable.** Eyebrows, section indices, metadata, chips, form labels.

```
display-xl  clamp(2.5rem, 5.5vw, 4.75rem)    line-height 1.05   hero h1
display-l   clamp(1.875rem, 3.5vw, 3rem)     line-height 1.1    section h2
title       clamp(1.25rem, 2vw, 1.5rem)      line-height 1.3    card h3
lead        clamp(1.125rem, 1.5vw, 1.375rem) line-height 1.55
body        1.125rem                         line-height 1.65
label       0.75rem  tracking 0.12em  uppercase  mono
```

Self-hosting the fonts isn't only about speed — loading Google Fonts from their CDN sends your visitors' IP addresses to Google, which a German court found to be a GDPR violation. You're selling "Trusted" as a pillar on your own home page. Practise it.

### 3.3 Copy register — the Anthropic part

- Sentence case everywhere, including headings and buttons. Never Title Case.
- Short declarative sentences. State what's true; don't sell it.
- No superlatives, no "cutting-edge", "seamless", "solutions", no exclamation marks.
- First person for the studio, second person for the reader.
- Buttons name the outcome: "Start a project", "See the work", "Send message".

### 3.4 Layout

12-column grid, container `1200px`, prose `70ch`. Section rhythm `padding-block: clamp(7rem, 14vh, 12rem)`. Radius `4px`, except the primary button which is a pill. One hairline divider between sections, never two.

### 3.5 Motion system

**Layer one — scroll choreography.**

1. **Smooth scroll** — Lenis, `lerp: 0.1`. Softened, not slippery.
2. **Masked line rise** — the signature. Heading split into lines, each in `overflow: hidden`, `translateY(110%) → 0`, 700ms, `cubic-bezier(0.16, 1, 0.3, 1)`, 70ms stagger. Once, at 20% into viewport. h1 and h2 only.
3. **Body reveal** — opacity 0→1 + 12px rise, 500ms, 60ms stagger.
4. **Hover label roll** — label rendered twice in a masked box; on hover the first slides out as the duplicate slides in. 300ms.
5. **Pinned pillars** — home page authority section pins its heading while pillars advance. Desktop only, plain stack below 1024px.
6. **Image wipe** — `clip-path: inset()` from the bottom, 800ms, with a 1.06→1 scale inside. Never a plain fade.
7. **Marquee** — slow continuous scroll, pauses on hover.
8. **Route transition** — 250ms fade with a 6px rise on the incoming route.

Under `prefers-reduced-motion: reduce`: Lenis off, all reveals render final state immediately, marquee static, water renders one frame. No exceptions.

### 3.6 Signature element — the water

The About page background, and a quieter version behind the home hero. The brief: sitting by a lake before sunrise. Calm, almost still, small movement, and now and then a bird crosses.

- **Canvas 2D**, no WebGL. Four stacked bands, each the sum of two or three sines with different frequencies, phases and drift speeds. Amplitude 10–24px, full period 20–40s. (Originally specified as 6–14px "if it reads as an animation, the amplitude is too high" — raised after that read as not animating at all. Amplitude is contrast-neutral: it changes how far the line moves, not the colour of anything, so this lever doesn't touch the About page's text-contrast measurement below.)
- **Color:** `--signal` at 7–10% alpha (`--water-alpha` in globals.css; originally 3–7%, raised for the same reason as amplitude — this one *does* affect the About page's measured text contrast, see §7 Phase 6), band nearest the horizon slightly lighter.
- **Rare events:** a ripple ring — the "fish jumping" event — expands and fades at a random point every 16–36s, dissipating over 4.5s, radius up to 170px. (Originally 25–60s / 110px; widened and made more frequent so it clearly reads as something breaking the surface rather than a faint line easy to miss.) A bird silhouette at 0.12 opacity crosses the upper area every 60–120s, taking ~18s — unchanged, wasn't flagged. Random intervals inside a range, never a fixed loop.
- **Text sits still on top.** Canvas is `pointer-events: none`, behind everything.
- **Performance:** rAF capped at 30fps, paused by `IntersectionObserver` when offscreen and on `document.hidden`, DPR capped at 2, debounced resize. Reduced motion draws one frame and stops.

A reference implementation exists in `krtse-xo-prototype.html` — read it before building the component.

### 3.7 Anti-patterns

Gradient blobs · glassmorphism · glowing orbs · emoji as icons · icon-in-a-circle grids · parallax · custom cursors · scroll-jacking · letter-by-letter heading animation · Title Case · lorem ipsum in committed code · stock photography · fabricated testimonials · numbering anything that isn't a real sequence.

---

## 4. Site structure

```
/                    home
/websites            card grid
/websites/:slug      detail page with image gallery
/about               static text over the water
/contact             form
*                    404

later, folders exist from Phase 0:
/shop  /shop/:slug  /cart  /checkout
/sign-in  /sign-up
/account  /account/orders
```

**Nav:** wordmark left · Home · Websites · About me · Contact as a signal-blue pill on the right. `Shop` inserts after `About me` later; the account menu replaces the Contact pill when a session exists. `Nav` accepts an optional `user` prop from day one so that's a data change, not a redesign.

**Footer:** hairline top border. Left: wordmark and a one-line statement. Middle: nav links. Right: email at `title` size, then Instagram, LinkedIn and GitHub as hairline-bordered squares that fill with `--signal` on hover, icon knocking out to white. Bottom row in mono: "Skopje, North Macedonia", live local time, copyright. Inline SVG brand marks from Simple Icons — brand logos don't belong in a general icon set.

---

## 5. Target file tree

```
krtse-xo/
├─ CLAUDE.md
├─ krtse-xo-build-plan.md
├─ index.html                  site-level OG tags live here
├─ vite.config.js
├─ jsconfig.json               for the @/ alias
├─ api/                        Vercel serverless functions — empty until Phase 8
├─ public/
│  ├─ work/<slug>/*.webp
│  └─ og/
└─ src/
   ├─ main.jsx                 font imports, globals.css, router mount
   ├─ App.jsx                  route config
   ├─ styles/globals.css
   ├─ routes/
   │  ├─ marketing/  Home.jsx  Websites.jsx  WebsiteDetail.jsx  About.jsx  Contact.jsx  NotFound.jsx
   │  ├─ shop/       README.md only
   │  ├─ auth/       README.md only
   │  └─ account/    README.md only
   ├─ layouts/       MarketingLayout.jsx
   ├─ components/
   │  ├─ primitives/  Container, Section, Eyebrow, Button, Chip, Divider, Stat
   │  ├─ motion/      SmoothScroll, MaskedLines, Reveal, ImageWipe, Marquee
   │  ├─ water/       WaterField.jsx
   │  ├─ site/        Nav, Footer, ThemeToggle, Seo, ProtectedRoute
   │  ├─ sections/    Hero, Pillars, SelectedWork, Process, BuiltWith, AboutStrip, ContactCta
   │  └─ shop/        CartProvider.jsx (no-op)
   ├─ content/        site.js  pillars.js  process.js  projects.js  types.js
   ├─ hooks/          useReducedMotion.js  useTheme.js  useScrolled.js
   └─ lib/            cn.js  seo.js
```

---

## 6. Home page

1. **Hero** — masked-line serif h1, lead paragraph, "See the work" (signal) and "Start a project" (ghost). Quiet water at the bottom edge.
2. **What a business website has to do in 2026** — the authority section, the pinned-scroll moment.
3. **Selected work** — three cards.
4. **How I work** — four numbered steps.
5. **Built with** — marquee.
6. **About strip** — three sentences and a link.
7. **Contact CTA** — one line, one button.

### 6.1 Authority section — starter copy

**Heading:** A website is not a brochure anymore
**Lead:** It's the part of your business that works while you sleep. Six things decide whether it does that well.

1. **Found** — People search in Google and increasingly ask an AI assistant instead. Both need the same things: real content, clean semantic HTML, structured data, pages that can be indexed. If a machine can't read the page, neither can your next customer.
2. **Fast** — Google measures loading, responsiveness and layout stability, and so do your visitors. On a phone, on a normal connection. Most business sites fail here on unoptimised images and third-party scripts nobody audits.
3. **Trusted** — Accessibility is a legal requirement for a lot of businesses selling into the EU now, not a nice-to-have. Add HTTPS, a real privacy policy, honest cookie consent and GDPR-compliant form handling. This is the part that gets ignored until it's expensive.
4. **Converting** — One clear action per page. Forms that work on a phone, submit reliably, and tell the person what happens next. Proof that you've done the work before.
5. **Connected** — The website is rarely the whole system. It talks to a CRM, an ERP, a payment provider, a booking tool. Getting that plumbing right is the difference between a site that looks finished and a business that runs.
6. **Owned** — You should be able to change your own content, read your own analytics, and take the site elsewhere if you want to. No lock-in, no agency holding the keys.

### 6.2 Starter copy to overwrite

- **h1:** "I build websites, and the systems behind them."
- **lead:** "Krtse XO is a one-person studio in Skopje. I design and build business websites, customer portals, and the integrations that connect them to the tools a company already runs on."
- **About strip:** "I've spent the last years building portals and integrations for companies whose systems have to actually work — invoices, payments, settlements, data moving between platforms. I bring the same standard to a five-page website."

---

## 7. Build phases

### Phase 0 — Configure the existing app

The Vite app already exists. This phase configures it; it does not scaffold from scratch.

**Prompt:**
> Read `CLAUDE.md` and `krtse-xo-build-plan.md`. This is an existing Vite + React + JavaScript project — configure it, don't re-scaffold.
>
> 1. Install: `react-router-dom motion lenis clsx tailwind-merge @fontsource-variable/newsreader @fontsource-variable/geist @fontsource-variable/geist-mono`, and as dev deps `tailwindcss @tailwindcss/vite`.
> 2. Add the Tailwind plugin to `vite.config.js` and an `@` alias pointing at `./src`. The project is ESM, so `__dirname` is not available — use `fileURLToPath(new URL('./src', import.meta.url))`. Add a matching `jsconfig.json` with `paths` so the editor resolves `@/`.
> 3. Create `src/styles/globals.css` from the starter file I'm providing. Import it in `main.jsx` along with the three font CSS files (`@fontsource-variable/newsreader/wght.css` and the equivalents for geist and geist-mono).
> 4. Delete the Vite starter's `App.css`, demo assets and boilerplate markup.
> 5. Create the folder structure in §5 of the plan. `routes/shop`, `routes/auth` and `routes/account` get only a `README.md` naming what will live there.
> 6. Set up `react-router-dom` in `App.jsx` with a `MarketingLayout` wrapping the five marketing routes plus a 404. Route components can be empty stubs.
> 7. Create `src/lib/cn.js` (clsx + tailwind-merge), `src/hooks/useReducedMotion.js`, `src/hooks/useTheme.js` (class-based, persisted to localStorage, light default, with an inline script in `index.html` that sets the class before paint so there's no flash).
> 8. Build a `/styleguide` route showing every colour token with its hex, the full type scale, buttons in all states, chips, and a hairline divider.
>
> No `tailwind.config.js` — Tailwind v4 is configured in CSS via `@theme`.

**Done when:** `npm run dev` shows the styleguide in both themes with no flash on reload, `npm run build` passes, `npm run lint` is clean.

---

### Phase 1 — Primitives and motion

**Prompt:**
> Build `src/components/primitives/`: `Container`, `Section` (rhythm from §3.4, optional mono eyebrow and index), `Eyebrow`, `Button` (variants signal / outline / ghost, all with the hover label roll from §3.5.4), `Chip`, `Divider`, `Stat`. Then `src/components/motion/`: `SmoothScroll` (Lenis provider, `lerp: 0.1`, cleaned up on unmount), `MaskedLines` (splits its text into lines and animates each per §3.5.2 — must re-split on resize, debounced), `Reveal` (§3.5.3), `ImageWipe` (§3.5.6), `Marquee` (§3.5.7).
>
> Every animated component reads the single `useReducedMotion` hook and renders the final state instantly when reduced motion is on — that check lives in the hook, not repeated in each component. Document each component's props with a JSDoc block. Add all of them to `/styleguide` with live examples.

**Done when:** the masked line rise looks right on a three-line heading at 375px and 1440px, resizing re-splits lines correctly, and everything freezes with reduced motion enabled in devtools.

---

### Phase 2 — Water field

Build it before any page and judge it before continuing. Riskiest piece.

**Prompt:**
> Build `src/components/water/WaterField.jsx` to the spec in §3.6. Read the reference implementation in `krtse-xo-prototype.html` first — the wave maths and the ripple/bird timing are already worked out there; port them into a proper React component with cleanup on unmount.
>
> Props: `variant` (`'lake' | 'horizon'`), `intensity` (0–1), `className`. Canvas 2D, four sine-summed bands, ripple events at random 25–60s intervals, a bird crossing at random 60–120s intervals. 30fps cap, `IntersectionObserver` and `document.hidden` pausing, DPR capped at 2, debounced resize, one static frame under reduced motion. No dependencies. Add both variants to `/styleguide` with a control that multiplies time by 20 so the ripple and bird can be verified without waiting.

**Done when:** at normal speed it reads as still water you happen to notice moving. If it draws attention to itself, cut amplitude and opacity, not frame rate.

---

### Phase 3 — Shell: nav, footer, layout

**Prompt:**
> Build `Nav` per §4: wordmark, Home / Websites / About me, Contact as a signal pill, theme toggle. Transparent over the hero, gaining a hairline border and blurred background after 64px of scroll — use the `useScrolled` hook, not an inline listener. Use `NavLink` from react-router for active states. Full-screen overlay menu under 768px with focus trapping and Escape to close. `Nav` accepts an optional `user` prop and renders an account menu placeholder when set; it is always `null` for now.
>
> Build `Footer` per §4 including the live Skopje clock (`Intl.DateTimeFormat` with `timeZone: 'Europe/Skopje'`, updating every 20s, cleared on unmount) and the three brand icons as inline SVG from Simple Icons in hairline squares that fill with signal blue on hover.
>
> Assemble `MarketingLayout` with `SmoothScroll`, `Nav`, an `<Outlet />`, and `Footer`. Add a `ScrollToTop` component that resets scroll on route change, and the 250ms route fade from §3.5.8.

**Done when:** correct at 375 / 768 / 1280, theme persists with no flash, mobile menu is fully keyboard-operable, navigating between routes resets scroll to the top.

---

### Phase 4 — Home page

**Prompt:**
> Create `src/content/site.js`, `pillars.js`, `process.js` using the copy from §6 of the plan verbatim — it's placeholder text I will edit, so it goes in content files, never inline in components.
>
> Build the sections in `src/components/sections/`: `Hero` (masked-line h1, lead, two buttons, `WaterField variant="horizon" intensity={0.35}` anchored to the bottom edge), `Pillars` (pinned heading per §3.5.5, plain stacked list below 1024px), `SelectedWork` (three cards — build the `ProjectCard` component here, Phase 5 imports it), `Process` (four numbered steps), `BuiltWith` (marquee), `AboutStrip`, `ContactCta`. Assemble in `routes/marketing/Home.jsx`.
>
> Follow §3.3: sentence case, no superlatives.

**Done when:** the page reads as one argument, the pinned section releases cleanly at both ends with no jump, nothing is Title Case.

---

### Phase 5 — Websites index and detail

**Prompt:**
> Create `src/content/types.js` with JSDoc typedefs, and `projects.js`. The `Project` shape: `slug, title, client, anonymized, year, type ('Website' | 'Portal' | 'Shop' | 'Integration' | 'App'), summary, description, stack[], liveUrl, cover, images[] (src, alt, caption), sections { context, problem, approach, result }, featured`. Scaffold four realistic entries with placeholder images in `public/work/<slug>/`.
>
> Build `/websites` as a two-column card grid where featured projects span full width, so the grid is asymmetric rather than uniform. Card: cover image with `ImageWipe` and 1.03 scale on hover, serif title, one-line summary, mono metadata row, stack chips. Filter chips by `type`, synced to the URL with `useSearchParams`.
>
> Build `/websites/:slug` using `useParams`, with a redirect to the 404 route for an unknown slug: header, context / problem / approach sections at 70ch, an image gallery alternating full-width and two-up with a keyboard-accessible lightbox, results as three mono-labelled figures, stack chips, live link, prev/next navigation.
>
> All images are plain `<img>` with explicit `width` and `height` attributes, `loading="lazy"` except the cover on the detail page which is eager, and `decoding="async"`. No layout shift.

**Done when:** the lightbox traps focus and closes on Escape, an anonymized client's real name appears nowhere in the DOM, and nothing shifts as images load.

---

### Phase 6 — About and contact

**Prompt:**
> Build `/about`: `WaterField variant="lake" intensity={0.6}` as a fixed full-viewport background layer with content scrolling over it, completely still — no reveal animation beyond the h1 masked rise. Content: two-paragraph bio, stack chips grouped by category, a short "how I work" list, availability. Verify body text contrast over the water in both themes rather than assuming it.
>
> Build `/contact`: name, email, company, project type select, message. Mono labels above hairline-bottom-bordered inputs, signal focus ring, validation on blur, real loading state, success and error copy per §3.3.
>
> Submission: this is a client-only app, so post to Web3Forms using a public access key in `VITE_WEB3FORMS_KEY`. That key is designed to be public — do not put any other kind of secret in a `VITE_` variable, since Vite compiles them into the client bundle. If the key is missing, the form degrades to a `mailto:` link rather than breaking. Add a honeypot field for spam.

**Done when:** About text is comfortably readable over the water at every breakpoint in both themes, and the form is fully keyboard-operable with `aria-live` error announcements.

---

### Phase 7 — Metadata and SEO

**Prompt:**
> Build `src/components/site/Seo.jsx`. React 19 hoists `<title>`, `<meta>` and `<link rel="canonical">` rendered anywhere in the tree, so no helmet library is needed — render the tags directly and confirm they land in `<head>`. Each route renders `<Seo>` with its own title, description, canonical and OG tags.
>
> Put site-level fallback OG tags in `index.html` — title, description, `og:image`, `twitter:card` — so link previews are correct even though they can't be per-route in an SPA. Create a static OG image at `public/og/default.png`: paper background, "KRTSE XO" in mono, the tagline in Newsreader, one signal-blue wave line along the bottom.
>
> Add `public/robots.txt`, a `public/sitemap.xml` generated at build time by a small Node script in `scripts/` that reads `src/content/projects.js`, and JSON-LD for `Person` and `ProfessionalService` in the root. Add the full favicon and manifest set.
>
> Finally, write `docs/prerendering.md` documenting how to add `vite-react-ssg` later for per-route static HTML and real per-page link previews, including which files would need to change. Do not install it now.

**Done when:** every route sets a unique document title, the site-level OG image renders in a link preview validator, and the sitemap lists all case studies.

---

### Phase 8 — Auth and shop seams

No features. This phase leaves the right holes.

**Prompt:**
> Prepare the codebase for authentication and a shop without installing either.
>
> 1. `src/lib/session.js`: a JSDoc `@typedef` for `SessionUser` and `getCurrentUser()` returning `null`.
> 2. `src/content/types.js`: add `Product` (with `kind: 'digital' | 'service'`), `CartItem`, `Cart`, `Order`, `OrderItem` typedefs.
> 3. `src/components/shop/CartProvider.jsx`: renders children, exposes a no-op context with the eventual shape, mounted in `App.jsx` so adding the shop doesn't require touching layouts.
> 4. `src/components/site/ProtectedRoute.jsx`: wrapper that redirects to `/sign-in` when `getCurrentUser()` returns null. Unused for now.
> 5. Create the root `api/` folder with `README.md` explaining that Vercel deploys files here as serverless functions alongside the Vite build, and that this is the only place a secret key may live. Add `api/.gitkeep`.
> 6. `docs/shop-architecture.md`: document the two viable paths and their trade-offs — (a) a backend-as-a-service handling auth and data directly from the browser, (b) serverless functions in `api/` with a hosted database. Note that in both cases the Stripe secret key and webhook signing secret live server-side only, never in a `VITE_` variable.
> 7. Add an ESLint rule that fails the build if anything under `src/` imports from `api/`.

**Done when:** the build passes, nothing user-visible changed, and adding auth later means filling in files that already exist.

---

### Phase 9 — QA and deploy

**Prompt:**
> Production audit. Run `npm run build` and fix: any layout shift, any image without dimensions, any chunk over 200KB gzipped — code-split routes with `React.lazy` and `Suspense` if needed. Test 375 / 768 / 1280 / 1920.
>
> Verify: keyboard reaches every interactive element with a visible signal focus ring; heading order is sequential; all images have alt text; the whole site works with `prefers-reduced-motion: reduce`; no body-size text uses `--signal` instead of `--text-link`. Profile the water field on a throttled CPU — if it exceeds ~2% while idle, reduce frame rate before reducing quality.
>
> Add `vercel.json` with an SPA rewrite so deep links like `/websites/some-slug` don't 404 on refresh. Write `.env.example` and a README with setup and deploy steps.

**Targets:** Lighthouse ≥ 95 on mobile across all four categories. LCP < 2.0s. CLS < 0.05.

**The SPA rewrite is not optional.** Without it, every direct link to a case study returns a 404 from the host. Test by deploying and refreshing on a deep link.

---

## 8. Backlog

### Phase D — the dandelion intro (approved, deferred)

The arrival sequence: a black-and-white line-art dandelion holds for a beat, faint signal-blue wind lines sweep through, the seeds release from the windward side first and drift off, and the headline rises into the exact space the flower occupied.

**The working implementation is `krtse-xo-dandelion-demo.html`** — port it rather than rebuilding. Notes for when you pick it up:

- The dandelion and the h1 share one positioning box, sized with `width: max-content; max-width: 16ch` so the flower centres on the headline's real width rather than the container's.
- Seeds are generated procedurally, staggered by a dot product against the wind vector so the windward side releases first. Three seeds are randomly left behind.
- Full sequence runs ~3.1s. It should play once per session, not on every route change — store a flag in `sessionStorage`.
- Under reduced motion, skip straight to the text with no flower.
- It runs before Lenis and before the first paint of the hero, so it needs care not to block LCP. Measure it.

Also in the backlog:

- **Prerendering** via `vite-react-ssg` — see `docs/prerendering.md` from Phase 7. Do this before you start sharing case-study links widely.
- **`/notes`** — short technical write-ups. Best long-term SEO play for your niche.
- **Macedonian locale.**
- **View transitions** between the work index and case studies.

---

## 9. Content you need to write

- [ ] Hero headline and lead in your own words.
- [ ] 4–6 projects: title, client or anonymized descriptor, year, type, one-line summary, problem, approach, 2–3 results, stack, live URL.
- [ ] Screenshots — cover plus 3–5 gallery images each, 1600px wide, consistent browser chrome or none across every project. Convert to WebP before committing.
- [ ] Bio, short and long.
- [ ] Four process steps.
- [ ] Email, Instagram, LinkedIn, GitHub URLs, availability.
- [ ] Confirm which clients you can name.

---

## 10. Working with Claude Code

- Keep `CLAUDE.md`, this plan, and both HTML prototypes in the repo root. Reference them by name at the start of every session.
- One phase per session. Commit at the end, message naming the phase.
- After Phases 2, 4 and 5, screenshot the result and ask it to critique its own output against §3 before you accept it.
- When it goes off-spec, point at the section number rather than describing the fix. That keeps the plan authoritative instead of the chat history.

# routes/shop

Reserved. Nothing here yet — the folder exists so the shop is a data change, not
a restructure.

Planned routes, per §4 of `krtse-xo-build-plan.md`:

| Route         | Component        | Purpose                                   |
| ------------- | ---------------- | ----------------------------------------- |
| `/shop`       | `Shop.jsx`       | Product index                             |
| `/shop/:slug` | `ProductDetail.jsx` | Single product, digital or service      |
| `/cart`       | `Cart.jsx`       | Line items, quantities, subtotal          |
| `/checkout`   | `Checkout.jsx`   | Hands off to Stripe                       |

Phase 8 lays the seams: `Product`, `CartItem`, `Cart`, `Order` and `OrderItem`
typedefs in `src/content/types.js`, and a no-op `CartProvider` mounted in
`App.jsx`.

**The Stripe secret key never lives in this folder**, or anywhere under `src/`.
Vite compiles every `VITE_*` variable into the client bundle. Secrets belong in
a serverless function under the root `api/` folder. See `docs/shop-architecture.md`
once Phase 8 has written it.

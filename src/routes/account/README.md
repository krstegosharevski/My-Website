# routes/account

Reserved. Nothing here yet.

Planned routes, per §4 of `krtse-xo-build-plan.md`:

| Route             | Component      | Purpose                        |
| ----------------- | -------------- | ------------------------------ |
| `/account`        | `Account.jsx`  | Profile and settings           |
| `/account/orders` | `Orders.jsx`   | Past orders and downloads      |

Everything here sits behind `ProtectedRoute` (Phase 8), which redirects to
`/sign-in` while `getCurrentUser()` returns `null`.

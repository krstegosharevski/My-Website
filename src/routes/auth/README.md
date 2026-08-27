# routes/auth

Reserved. Nothing here yet.

Planned routes, per §4 of `krtse-xo-build-plan.md`:

| Route       | Component     | Purpose            |
| ----------- | ------------- | ------------------ |
| `/sign-in`  | `SignIn.jsx`  | Existing customers |
| `/sign-up`  | `SignUp.jsx`  | New accounts       |

No auth provider is installed, and none should be until the phase that calls for
it. `src/lib/session.js` (Phase 8) is the seam: it exports `getCurrentUser()`,
which returns `null` today. `Nav` already accepts an optional `user` prop, so
adding a session is a data change rather than a redesign.

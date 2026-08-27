/**
 * The seam auth fills in later. No provider is installed yet — reserved, per
 * CLAUDE.md, until the phase that calls for it.
 *
 * `Nav` already accepts an optional `user` prop and renders `null` for it
 * today; wiring a real provider means changing what `getCurrentUser()` returns,
 * not touching `Nav`, `MarketingLayout`, or any page that reads a session.
 */

/**
 * @typedef {object} SessionUser
 * @property {string} id
 * @property {string} name
 * @property {string} email
 */

/**
 * The signed-in user, or `null`.
 *
 * Synchronous today because there is nothing to check. A real provider will
 * likely make this async (reading a cookie, verifying a token) — every current
 * caller (`Nav`, `ProtectedRoute`) should be updated together with this
 * function rather than adding a second, async variant alongside it.
 *
 * @returns {SessionUser | null}
 */
export function getCurrentUser() {
  return null
}

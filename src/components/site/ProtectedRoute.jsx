import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { getCurrentUser } from '@/lib/session'

/**
 * Redirects to `/sign-in` when `getCurrentUser()` returns `null`. Wrap a
 * `<Route>` with this as its element and nest the protected routes under it,
 * the same way `MarketingLayout` wraps the marketing routes.
 *
 * Unused today — `/sign-in` does not exist yet, and every current route is
 * public. This is here so `routes/account` can be filled in later without
 * also having to write the gate.
 *
 * The attempted path is carried in `state`, so the sign-in flow can send the
 * visitor back to what they actually asked for instead of always landing on
 * `/account`.
 *
 * @returns {JSX.Element}
 */
export function ProtectedRoute() {
  const location = useLocation()
  const user = getCurrentUser()

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  return <Outlet />
}

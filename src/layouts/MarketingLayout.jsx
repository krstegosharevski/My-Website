import { Outlet } from 'react-router-dom'

/**
 * Chrome shared by every marketing route.
 *
 * Phase 3 fills this in with `SmoothScroll`, `Nav`, `Footer` and the route
 * fade. For now it only provides the outlet so routing can be verified.
 *
 * @returns {JSX.Element}
 */
export function MarketingLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

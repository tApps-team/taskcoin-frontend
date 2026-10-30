import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useIsAuthenticated, useSession } from '@/entities/session'

// User area: requires an authenticated non-admin. Admins are sent to their area.
export function RequireAuth() {
  const isAuth = useIsAuthenticated()
  const { user } = useSession()
  const loc = useLocation()
  // Remember where they were going, so signing in finishes the trip instead
  // of dropping them on the default screen.
  if (!isAuth) {
    const next = encodeURIComponent(loc.pathname + loc.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  if (user?.role === 'super_admin') return <Navigate to="/admin" replace />
  return <Outlet />
}

// Admin area: requires an authenticated super_admin. Regular users go to their area.
export function RequireAdmin() {
  const isAuth = useIsAuthenticated()
  const { user } = useSession()
  if (!isAuth) return <Navigate to="/admin/login" replace />
  if (!user || user.role !== 'super_admin') return <Navigate to="/app" replace />
  return <Outlet />
}

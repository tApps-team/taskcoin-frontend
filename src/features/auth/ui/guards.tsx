import { Navigate, Outlet } from 'react-router-dom'
import { useIsAuthenticated, useSession } from '@/entities/session'

// User area: requires an authenticated non-admin. Admins are sent to their area.
export function RequireAuth() {
  const isAuth = useIsAuthenticated()
  const { user } = useSession()
  if (!isAuth) return <Navigate to="/login" replace />
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

import { useSelector } from 'react-redux'
import { getAccess } from '@/shared/lib/tokens'
import type { SessionState } from './slice'

// Session owns its slice of state; components read it without a global RootState.
export function useSession(): SessionState {
  return useSelector((s: { session: SessionState }) => s.session)
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useSession()
  return isAuthenticated || Boolean(getAccess())
}

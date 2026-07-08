// Pure localStorage token helpers (no business logic) so the shared API layer
// can read/write auth tokens without importing upper layers.
export const ACCESS_KEY = 'taskcoin_access'
export const REFRESH_KEY = 'taskcoin_refresh'
export const USER_KEY = 'taskcoin_user'

export const getAccess = () => localStorage.getItem(ACCESS_KEY)
export const getRefresh = () => localStorage.getItem(REFRESH_KEY)

export function saveTokens(access: string, refresh?: string) {
  localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

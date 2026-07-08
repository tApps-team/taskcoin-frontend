import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/shared/api/types'
import { clearTokens, getAccess, saveTokens, USER_KEY } from '@/shared/lib/tokens'

export interface SessionState {
  user: User | null
  isAuthenticated: boolean
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

const initialState: SessionState = {
  user: loadUser(),
  isAuthenticated: Boolean(getAccess()),
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ access: string; refresh?: string; user: User }>,
    ) {
      saveTokens(action.payload.access, action.payload.refresh)
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user))
      state.user = action.payload.user
      state.isAuthenticated = true
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload))
    },
    loggedOut(state) {
      clearTokens()
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const { setCredentials, setUser, loggedOut } = sessionSlice.actions
export const sessionReducer = sessionSlice.reducer

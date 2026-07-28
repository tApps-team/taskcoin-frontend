import { configureStore, isRejectedWithValue, type Middleware } from '@reduxjs/toolkit'
import { toast } from 'sonner'
import { sessionReducer } from '@/entities/session'
import { baseApi } from '@/shared/api'
import { getErrorMessage } from '@/shared/lib/errors'

// Surface any failed RTK Query mutation as a toast so a rejected request never
// silently fails or crashes the render (FastAPI 422 details are arrays).
const errorToast: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const arg = (action as { meta?: { arg?: { type?: string } } }).meta?.arg
    if (arg?.type === 'mutation') {
      toast.error(getErrorMessage((action as { payload?: unknown }).payload))
    }
  }
  return next(action)
}

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(baseApi.middleware, errorToast),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

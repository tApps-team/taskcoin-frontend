import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import { getAccess, getRefresh, saveTokens } from '@/shared/lib/tokens'

const baseUrl = (import.meta.env.VITE_API_URL as string | undefined) || '/api'

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    const token = getAccess()
    if (token) headers.set('authorization', `Bearer ${token}`)
    return headers
  },
})

// Transparently refresh the access token on 401. On failure, emits a plain
// `session/loggedOut` action (matched by the session slice) to avoid importing
// an upper layer from `shared`.
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)
  if (result.error && result.error.status === 401) {
    const refresh = getRefresh()
    if (refresh) {
      const refreshResult = await rawBaseQuery(
        { url: '/auth/refresh', method: 'POST', body: { refresh } },
        api,
        extraOptions,
      )
      const data = refreshResult.data as { access: string } | undefined
      if (data?.access) {
        saveTokens(data.access)
        result = await rawBaseQuery(args, api, extraOptions)
      } else {
        api.dispatch({ type: 'session/loggedOut' })
      }
    } else {
      api.dispatch({ type: 'session/loggedOut' })
    }
  }
  return result
}

// Entities inject their own endpoints via `baseApi.injectEndpoints`.
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Tasks',
    'Task',
    'Submissions',
    'Withdrawals',
    'Settings',
    'Me',
    'Stats',
    'AdminUsers',
    'AdminTasks',
    'AdminSubmissions',
    'AdminWithdrawals',
    'Dashboard',
    'Categories',
  ],
  endpoints: () => ({}),
})

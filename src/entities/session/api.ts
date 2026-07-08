import { baseApi } from '@/shared/api'
import type { AuthResponse, User } from '@/shared/api/types'

export const sessionApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    devLogin: b.mutation<AuthResponse, { email: string }>({
      query: (body) => ({ url: '/auth/dev-login', method: 'POST', body }),
    }),
    adminLogin: b.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/admin/login', method: 'POST', body }),
    }),
    googleLogin: b.mutation<AuthResponse, { id_token: string }>({
      query: (body) => ({ url: '/auth/google', method: 'POST', body }),
    }),
    me: b.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),
  }),
})

export const {
  useDevLoginMutation,
  useAdminLoginMutation,
  useGoogleLoginMutation,
  useMeQuery,
} = sessionApi

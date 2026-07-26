import { baseApi } from '@/shared/api'
import type { AuthResponse, User } from '@/shared/api/types'

export const sessionApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    register: b.mutation<
      AuthResponse,
      { email: string; password: string; full_name?: string; platform?: string }
    >({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: b.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    adminLogin: b.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/admin/login', method: 'POST', body }),
    }),
    updateProfile: b.mutation<
      User,
      { full_name?: string; platform?: string; country?: string }
    >({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['Me'],
    }),
    me: b.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useAdminLoginMutation,
  useUpdateProfileMutation,
  useMeQuery,
} = sessionApi

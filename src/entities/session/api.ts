import { baseApi } from '@/shared/api'
import type { AuthResponse, User } from '@/shared/api/types'

export const sessionApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    register: b.mutation<
      AuthResponse,
      {
        email: string
        password: string
        full_name?: string
        platform?: string
        country?: string
        referral_code?: string
      }
    >({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    // `country` is whatever the sign-in form's select is showing: it is saved
    // on every login, which is the one moment a permanent VPN user is offered
    // a correction.
    login: b.mutation<AuthResponse, { email: string; password: string; country?: string }>({
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
      // Country and OS are exactly what the offer list is filtered by, so a
      // change to either has to drop the cached offers — otherwise the user
      // saves a new country and the old, empty list is served straight back
      // from cache. A name change touches nothing but the profile.
      invalidatesTags: (_r, _e, arg) =>
        arg.country || arg.platform ? ['Me', 'Offers'] : ['Me'],
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

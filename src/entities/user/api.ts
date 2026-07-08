import { baseApi } from '@/shared/api'
import type { Paginated, User, UserStats } from '@/shared/api/types'

export const userApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getMyStats: b.query<UserStats, void>({
      query: () => '/users/me/stats',
      providesTags: ['Stats'],
    }),
    adminGetUsers: b.query<
      Paginated<User>,
      { search?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({ url: '/admin/users', params: params || undefined }),
      providesTags: ['AdminUsers'],
    }),
    adminCreateUser: b.mutation<User, Record<string, unknown>>({
      query: (body) => ({ url: '/admin/users', method: 'POST', body }),
      invalidatesTags: ['AdminUsers', 'Dashboard'],
    }),
    adminUpdateUser: b.mutation<User, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/admin/users/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['AdminUsers'],
    }),
    adminAdjustBalance: b.mutation<User, { id: string; amount: string; comment?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/users/${id}/balance`, method: 'POST', body }),
      invalidatesTags: ['AdminUsers'],
    }),
    adminDeleteUser: b.mutation<void, string>({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminUsers', 'Dashboard'],
    }),
  }),
})

export const {
  useGetMyStatsQuery,
  useAdminGetUsersQuery,
  useAdminCreateUserMutation,
  useAdminUpdateUserMutation,
  useAdminAdjustBalanceMutation,
  useAdminDeleteUserMutation,
} = userApi

import { baseApi } from '@/shared/api'
import type { AdminWithdrawal, Paginated, Withdrawal } from '@/shared/api/types'

export const withdrawalApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getMyWithdrawals: b.query<Paginated<Withdrawal>, void>({
      query: () => '/withdrawals/my',
      providesTags: ['Withdrawals'],
    }),
    createWithdrawal: b.mutation<
      Withdrawal,
      { amount_coins: string; card_number: string; card_holder?: string }
    >({
      query: (body) => ({ url: '/withdrawals', method: 'POST', body }),
      invalidatesTags: ['Withdrawals', 'Me', 'Stats'],
    }),

    // admin
    adminGetWithdrawals: b.query<
      Paginated<AdminWithdrawal>,
      { status?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({ url: '/admin/withdrawals', params: params || undefined }),
      providesTags: ['AdminWithdrawals'],
    }),
    adminMarkPaid: b.mutation<AdminWithdrawal, string>({
      query: (id) => ({ url: `/admin/withdrawals/${id}/mark-paid`, method: 'POST' }),
      invalidatesTags: ['AdminWithdrawals', 'Dashboard'],
    }),
    adminRejectWithdrawal: b.mutation<AdminWithdrawal, { id: string; comment: string }>({
      query: ({ id, comment }) => ({
        url: `/admin/withdrawals/${id}/reject`,
        method: 'POST',
        body: { comment },
      }),
      invalidatesTags: ['AdminWithdrawals', 'Dashboard'],
    }),
  }),
})

export const {
  useGetMyWithdrawalsQuery,
  useCreateWithdrawalMutation,
  useAdminGetWithdrawalsQuery,
  useAdminMarkPaidMutation,
  useAdminRejectWithdrawalMutation,
} = withdrawalApi

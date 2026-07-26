import { baseApi } from '@/shared/api'
import type {
  AdminWithdrawal,
  DenominationPublic,
  Paginated,
  Withdrawal,
} from '@/shared/api/types'

export const withdrawalApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getDenominations: b.query<DenominationPublic[], void>({
      query: () => '/withdrawals/denominations',
      providesTags: ['Denominations'],
    }),
    getMyWithdrawals: b.query<Paginated<Withdrawal>, void>({
      query: () => '/withdrawals/my',
      providesTags: ['Withdrawals'],
    }),
    createWithdrawal: b.mutation<Withdrawal, { denomination_id: string }>({
      query: (body) => ({ url: '/withdrawals', method: 'POST', body }),
      invalidatesTags: ['Withdrawals', 'Me', 'Stats', 'Denominations'],
    }),

    // admin
    adminGetWithdrawals: b.query<
      Paginated<AdminWithdrawal>,
      { status?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({ url: '/admin/withdrawals', params: params || undefined }),
      providesTags: ['AdminWithdrawals'],
    }),
  }),
})

export const {
  useGetDenominationsQuery,
  useGetMyWithdrawalsQuery,
  useCreateWithdrawalMutation,
  useAdminGetWithdrawalsQuery,
} = withdrawalApi

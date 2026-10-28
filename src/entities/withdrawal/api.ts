import { baseApi } from '@/shared/api'
import type {
  AdminWithdrawal,
  DenominationPublic,
  MobileOperator,
  Paginated,
  PayoutBalance,
  PhonePayoutOptions,
  PhonePayoutQuote,
  Withdrawal,
} from '@/shared/api/types'

export const withdrawalApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getDenominations: b.query<DenominationPublic[], void>({
      query: () => '/withdrawals/denominations',
      providesTags: ['Denominations'],
    }),
    getPhonePayoutOptions: b.query<PhonePayoutOptions, void>({
      query: () => '/withdrawals/phone/options',
      providesTags: ['PayoutOptions'],
    }),
    // Not cached by tag: it is a pure function of the amount, and the only
    // thing that could invalidate it is a tariff change that needs a redeploy.
    getPhonePayoutQuote: b.query<PhonePayoutQuote, string>({
      query: (amount) => ({ url: '/withdrawals/phone/quote', params: { amount } }),
    }),
    getMyWithdrawals: b.query<Paginated<Withdrawal>, void>({
      query: () => '/withdrawals/my',
      providesTags: ['Withdrawals'],
    }),
    createWithdrawal: b.mutation<Withdrawal, { denomination_id: string }>({
      query: (body) => ({ url: '/withdrawals', method: 'POST', body }),
      invalidatesTags: ['Withdrawals', 'Me', 'Stats', 'Denominations'],
    }),
    createPhoneWithdrawal: b.mutation<
      Withdrawal,
      { amount: string; phone: string; operator: MobileOperator }
    >({
      query: (body) => ({ url: '/withdrawals/phone', method: 'POST', body }),
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
    adminGetPayoutBalance: b.query<PayoutBalance, void>({
      query: () => '/admin/payouts/balance',
      providesTags: ['PayoutBalance'],
    }),
    adminCancelWithdrawal: b.mutation<AdminWithdrawal, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/withdrawals/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['AdminWithdrawals', 'AdminUsers', 'Dashboard'],
    }),
  }),
})

export const {
  useGetDenominationsQuery,
  useGetPhonePayoutOptionsQuery,
  useGetPhonePayoutQuoteQuery,
  useGetMyWithdrawalsQuery,
  useCreateWithdrawalMutation,
  useCreatePhoneWithdrawalMutation,
  useAdminGetWithdrawalsQuery,
  useAdminGetPayoutBalanceQuery,
  useAdminCancelWithdrawalMutation,
} = withdrawalApi

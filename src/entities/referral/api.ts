import { baseApi } from '@/shared/api'
import type { AdminReferralSummary, ReferralSummary } from '@/shared/api/types'

export const referralApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getMyReferrals: b.query<ReferralSummary, void>({
      query: () => '/referrals/me',
      providesTags: ['Referrals'],
    }),
    adminGetUserReferrals: b.query<AdminReferralSummary, string>({
      query: (userId) => `/admin/users/${userId}/referrals`,
      providesTags: ['Referrals'],
    }),
    adminGetReferralPercent: b.query<{ percent: string }, void>({
      query: () => '/admin/referral-percent',
      providesTags: ['ReferralTiers'],
    }),
    adminUpdateReferralPercent: b.mutation<{ percent: string }, { percent: string }>({
      query: (body) => ({ url: '/admin/referral-percent', method: 'PUT', body }),
      // The user-facing card shows it too, so refresh both.
      invalidatesTags: ['ReferralTiers', 'Referrals'],
    }),
  }),
})

export const {
  useGetMyReferralsQuery,
  useAdminGetUserReferralsQuery,
  useAdminGetReferralPercentQuery,
  useAdminUpdateReferralPercentMutation,
} = referralApi

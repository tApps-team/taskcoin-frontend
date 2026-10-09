import { baseApi } from '@/shared/api'
import type { AdminReferralSummary, ReferralSummary, ReferralTier } from '@/shared/api/types'

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
    adminGetReferralTiers: b.query<ReferralTier[], void>({
      query: () => '/admin/referral-tiers',
      providesTags: ['ReferralTiers'],
    }),
    adminUpdateReferralTiers: b.mutation<ReferralTier[], { tiers: ReferralTier[] }>({
      query: (body) => ({ url: '/admin/referral-tiers', method: 'PUT', body }),
      // The user-facing card shows these too, so refresh both.
      invalidatesTags: ['ReferralTiers', 'Referrals'],
    }),
  }),
})

export const {
  useGetMyReferralsQuery,
  useAdminGetUserReferralsQuery,
  useAdminGetReferralTiersQuery,
  useAdminUpdateReferralTiersMutation,
} = referralApi

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
  }),
})

export const { useGetMyReferralsQuery, useAdminGetUserReferralsQuery } = referralApi

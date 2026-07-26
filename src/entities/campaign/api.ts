import { baseApi } from '@/shared/api'
import type { Campaign, Paginated } from '@/shared/api/types'

export const campaignApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    adminGetCampaigns: b.query<
      Paginated<Campaign>,
      { status?: string; application_id?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({ url: '/admin/campaigns', params: params || undefined }),
      providesTags: ['Campaigns'],
    }),
    adminGetCampaign: b.query<Campaign, string>({
      query: (id) => `/admin/campaigns/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Campaigns', id }],
    }),
    adminCreateCampaign: b.mutation<Campaign, Record<string, unknown>>({
      query: (body) => ({ url: '/admin/campaigns', method: 'POST', body }),
      invalidatesTags: ['Campaigns', 'Dashboard'],
    }),
    adminUpdateCampaign: b.mutation<Campaign, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/admin/campaigns/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Campaigns'],
    }),
    adminSetCampaignStatus: b.mutation<Campaign, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/campaigns/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Campaigns', 'Dashboard'],
    }),
    adminDeleteCampaign: b.mutation<void, string>({
      query: (id) => ({ url: `/admin/campaigns/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Campaigns'],
    }),
  }),
})

export const {
  useAdminGetCampaignsQuery,
  useAdminGetCampaignQuery,
  useAdminCreateCampaignMutation,
  useAdminUpdateCampaignMutation,
  useAdminSetCampaignStatusMutation,
  useAdminDeleteCampaignMutation,
} = campaignApi

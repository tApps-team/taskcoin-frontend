import { baseApi } from '@/shared/api'
import type { Execution, Offer, OfferDetail } from '@/shared/api/types'

export const offerApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getOffers: b.query<Offer[], { limit?: number; offset?: number } | void>({
      query: (params) => ({ url: '/offers', params: params || undefined }),
      providesTags: ['Offers'],
    }),
    getOffer: b.query<OfferDetail, string>({
      query: (id) => `/offers/${id}`,
      // The bare 'Offers' tag comes along with the per-id one: RTK Query treats
      // 'Offers' and { type: 'Offers', id } as different tags, so without it an
      // invalidation of the list would leave a stale detail page cached for an
      // offer the user can no longer take (country changed -> 409 on start).
      providesTags: (_r, _e, id) => [{ type: 'Offers', id }, 'Offers'],
    }),
    startOffer: b.mutation<Execution, { campaignId: string; keywordId?: string }>({
      query: ({ campaignId, keywordId }) => ({
        url: `/offers/${campaignId}/start`,
        method: 'POST',
        params: keywordId ? { keyword_id: keywordId } : undefined,
      }),
      invalidatesTags: ['Offers', 'Executions'],
    }),
  }),
})

export const { useGetOffersQuery, useGetOfferQuery, useStartOfferMutation } = offerApi

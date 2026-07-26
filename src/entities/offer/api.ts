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
      providesTags: (_r, _e, id) => [{ type: 'Offers', id }],
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

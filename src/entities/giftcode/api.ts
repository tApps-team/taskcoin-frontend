import { baseApi } from '@/shared/api'
import type { Denomination, GiftCodeAdmin, Paginated } from '@/shared/api/types'

export const giftcodeApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    adminGetDenominations: b.query<Denomination[], void>({
      query: () => '/admin/gift/denominations',
      providesTags: ['Denominations'],
    }),
    // The stock itself: which codes are sitting unused and who got the rest.
    adminGetGiftCodes: b.query<
      Paginated<GiftCodeAdmin>,
      { denomination_id?: string; status?: string; limit?: number; offset?: number }
    >({
      query: (params) => ({ url: '/admin/gift/codes', params }),
      providesTags: ['GiftCodes'],
    }),
    adminCreateDenomination: b.mutation<Denomination, Record<string, unknown>>({
      query: (body) => ({ url: '/admin/gift/denominations', method: 'POST', body }),
      invalidatesTags: ['Denominations'],
    }),
    adminUpdateDenomination: b.mutation<Denomination, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/admin/gift/denominations/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Denominations'],
    }),
    adminDeleteDenomination: b.mutation<void, string>({
      query: (id) => ({ url: `/admin/gift/denominations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Denominations'],
    }),
    adminAddGiftCodes: b.mutation<
      { detail: string },
      { denomination_id: string; codes: { card_number: string; card_code: string }[] }
    >({
      query: (body) => ({ url: '/admin/gift/codes', method: 'POST', body }),
      invalidatesTags: ['Denominations', 'GiftCodes', 'Dashboard'],
    }),
  }),
})

export const {
  useAdminGetDenominationsQuery,
  useAdminGetGiftCodesQuery,
  useAdminCreateDenominationMutation,
  useAdminUpdateDenominationMutation,
  useAdminDeleteDenominationMutation,
  useAdminAddGiftCodesMutation,
} = giftcodeApi

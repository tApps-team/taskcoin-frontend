import { baseApi } from '@/shared/api'

export interface StandardInstruction {
  media_url: string | null
  text: string | null
}

// The five global standard instructions, keyed by screenshot slot + platform.
export type StandardInstructionKey =
  | 'main'
  | 'review_ios'
  | 'review_android'
  | 'rating_ios'
  | 'rating_android'

export type StandardInstructions = Record<StandardInstructionKey, StandardInstruction>

export const standardInstructionApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getStandardInstruction: b.query<StandardInstructions, void>({
      query: () => '/admin/standard-instruction',
      providesTags: ['StandardInstruction'],
    }),
    updateStandardInstruction: b.mutation<StandardInstructions, StandardInstructions>({
      query: (body) => ({ url: '/admin/standard-instruction', method: 'PUT', body }),
      invalidatesTags: ['StandardInstruction'],
    }),
  }),
})

export const { useGetStandardInstructionQuery, useUpdateStandardInstructionMutation } =
  standardInstructionApi

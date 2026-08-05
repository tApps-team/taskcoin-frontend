import { baseApi } from '@/shared/api'

export interface StandardInstruction {
  media_url: string | null
  text: string | null
}

export const standardInstructionApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getStandardInstruction: b.query<StandardInstruction, void>({
      query: () => '/admin/standard-instruction',
      providesTags: ['StandardInstruction'],
    }),
    updateStandardInstruction: b.mutation<StandardInstruction, StandardInstruction>({
      query: (body) => ({ url: '/admin/standard-instruction', method: 'PUT', body }),
      invalidatesTags: ['StandardInstruction'],
    }),
  }),
})

export const { useGetStandardInstructionQuery, useUpdateStandardInstructionMutation } =
  standardInstructionApi

import { baseApi } from '@/shared/api'

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    uploadImage: b.mutation<{ url: string }, FormData>({
      query: (body) => ({ url: '/uploads', method: 'POST', body }),
    }),
  }),
})

export const { useUploadImageMutation } = uploadApi

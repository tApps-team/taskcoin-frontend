import { baseApi } from '@/shared/api'
import type { Category } from '@/shared/api/types'

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getCategories: b.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Categories'],
    }),
  }),
})

export const { useGetCategoriesQuery } = categoryApi

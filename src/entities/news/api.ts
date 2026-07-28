import { baseApi } from '@/shared/api'
import type { NewsArticle } from '@/shared/api/types'

export const newsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getNews: b.query<NewsArticle[], void>({
      query: () => '/news',
      providesTags: ['News'],
    }),
    getArticle: b.query<NewsArticle, string>({
      query: (id) => `/news/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'News', id }],
    }),

    // admin
    adminGetNews: b.query<NewsArticle[], void>({
      query: () => '/admin/news',
      providesTags: ['News'],
    }),
    adminCreateNews: b.mutation<NewsArticle, Record<string, unknown>>({
      query: (body) => ({ url: '/admin/news', method: 'POST', body }),
      invalidatesTags: ['News'],
    }),
    adminUpdateNews: b.mutation<NewsArticle, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/admin/news/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['News'],
    }),
    adminDeleteNews: b.mutation<void, string>({
      query: (id) => ({ url: `/admin/news/${id}`, method: 'DELETE' }),
      invalidatesTags: ['News'],
    }),
  }),
})

export const {
  useGetNewsQuery,
  useGetArticleQuery,
  useAdminGetNewsQuery,
  useAdminCreateNewsMutation,
  useAdminUpdateNewsMutation,
  useAdminDeleteNewsMutation,
} = newsApi

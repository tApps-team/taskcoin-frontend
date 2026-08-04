import { baseApi } from '@/shared/api'
import type { Application } from '@/shared/api/types'

export const applicationApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    adminGetApplications: b.query<Application[], void>({
      query: () => '/admin/applications',
      providesTags: ['Applications'],
    }),
    adminCreateApplication: b.mutation<Application, Record<string, unknown>>({
      query: (body) => ({ url: '/admin/applications', method: 'POST', body }),
      invalidatesTags: ['Applications'],
    }),
    adminUpdateApplication: b.mutation<Application, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/admin/applications/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Applications', 'Campaigns'],
    }),
    adminDeleteApplication: b.mutation<void, string>({
      query: (id) => ({ url: `/admin/applications/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Applications', 'Campaigns'],
    }),
    adminUploadImage: b.mutation<{ url: string }, FormData>({
      query: (body) => ({ url: '/uploads', method: 'POST', body }),
    }),
    adminFetchStoreMeta: b.mutation<{ name: string | null; icon_url: string | null }, { store_url: string }>({
      query: (body) => ({ url: '/admin/applications/fetch-meta', method: 'POST', body }),
    }),
  }),
})

export const {
  useAdminGetApplicationsQuery,
  useAdminCreateApplicationMutation,
  useAdminUpdateApplicationMutation,
  useAdminDeleteApplicationMutation,
  useAdminUploadImageMutation,
  useAdminFetchStoreMetaMutation,
} = applicationApi

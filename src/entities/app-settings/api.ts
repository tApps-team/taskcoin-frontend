import { baseApi } from '@/shared/api'
import type { DashboardStats, PublicSettings } from '@/shared/api/types'

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getPublicSettings: b.query<PublicSettings, void>({
      query: () => '/settings/public',
      providesTags: ['Settings'],
    }),
    adminGetSettings: b.query<PublicSettings, void>({
      query: () => '/admin/settings',
      providesTags: ['Settings'],
    }),
    adminUpdateSettings: b.mutation<PublicSettings, Record<string, unknown>>({
      query: (body) => ({ url: '/admin/settings', method: 'PUT', body }),
      invalidatesTags: ['Settings'],
    }),
    adminDashboard: b.query<DashboardStats, void>({
      query: () => '/admin/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
  }),
})

export const {
  useGetPublicSettingsQuery,
  useAdminGetSettingsQuery,
  useAdminUpdateSettingsMutation,
  useAdminDashboardQuery,
} = settingsApi

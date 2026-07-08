export type { PublicSettings, DashboardStats } from '@/shared/api/types'
export {
  settingsApi,
  useGetPublicSettingsQuery,
  useAdminGetSettingsQuery,
  useAdminUpdateSettingsMutation,
  useAdminDashboardQuery,
} from './api'

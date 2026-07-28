import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAdmin, RequireAuth } from '@/features/auth'
import { AdminApplicationsPage } from '@/pages/admin-applications'
import { AdminCampaignDetailsPage } from '@/pages/admin-campaign-details'
import { AdminCampaignsPage } from '@/pages/admin-campaigns'
import { AdminExecutionsPage } from '@/pages/admin-executions'
import { AdminGiftCodesPage } from '@/pages/admin-gift-codes'
import { AdminLoginPage } from '@/pages/admin-login'
import { AdminSettingsPage } from '@/pages/admin-settings'
import { AdminUsersPage } from '@/pages/admin-users'
import { AdminWithdrawalsPage } from '@/pages/admin-withdrawals'
import { DashboardPage } from '@/pages/admin-dashboard'
import { ActivePage } from '@/pages/active'
import { HistoryPage } from '@/pages/history'
import { AdminNewsPage } from '@/pages/admin-news'
import { LoginPage } from '@/pages/login'
import { NewsArticlePage } from '@/pages/news-article'
import { OfferDetailsPage } from '@/pages/offer-details'
import { OffersPage } from '@/pages/offers'
import { ProfilePage } from '@/pages/profile'
import { WithdrawPage } from '@/pages/withdraw'
import { AdminLayout } from '@/widgets/admin-layout'
import { AppLayout } from '@/widgets/app-layout'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<OffersPage />} />
          <Route path="offers/:id" element={<OfferDetailsPage />} />
          <Route path="news/:id" element={<NewsArticlePage />} />
          <Route path="active" element={<ActivePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="withdraw" element={<WithdrawPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="campaigns" element={<AdminCampaignsPage />} />
          <Route path="campaigns/:id" element={<AdminCampaignDetailsPage />} />
          <Route path="executions" element={<AdminExecutionsPage />} />
          <Route path="news" element={<AdminNewsPage />} />
          <Route path="gift-codes" element={<AdminGiftCodesPage />} />
          <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}

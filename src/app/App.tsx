import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAdmin, RequireAuth } from '@/features/auth'
import { ActivePage } from '@/pages/active'
import { HistoryPage } from '@/pages/history'
import { LoginPage } from '@/pages/login'
import { OfferDetailsPage } from '@/pages/offer-details'
import { OffersPage } from '@/pages/offers'
import { ProfilePage } from '@/pages/profile'
import { WithdrawPage } from '@/pages/withdraw'
import { Spinner } from '@/shared/ui'
import { AppLayout } from '@/widgets/app-layout'

// Lazy: the news article screen pulls in TipTap, and the whole admin area is
// irrelevant to regular users — keep both out of the initial user bundle.
const NewsArticlePage = lazy(() =>
  import('@/pages/news-article').then((m) => ({ default: m.NewsArticlePage })),
)
const AdminLoginPage = lazy(() =>
  import('@/pages/admin-login').then((m) => ({ default: m.AdminLoginPage })),
)
const AdminLayout = lazy(() =>
  import('@/widgets/admin-layout').then((m) => ({ default: m.AdminLayout })),
)
const DashboardPage = lazy(() =>
  import('@/pages/admin-dashboard').then((m) => ({ default: m.DashboardPage })),
)
const AdminUsersPage = lazy(() =>
  import('@/pages/admin-users').then((m) => ({ default: m.AdminUsersPage })),
)
const AdminApplicationsPage = lazy(() =>
  import('@/pages/admin-applications').then((m) => ({ default: m.AdminApplicationsPage })),
)
const AdminCampaignsPage = lazy(() =>
  import('@/pages/admin-campaigns').then((m) => ({ default: m.AdminCampaignsPage })),
)
const AdminCampaignDetailsPage = lazy(() =>
  import('@/pages/admin-campaign-details').then((m) => ({ default: m.AdminCampaignDetailsPage })),
)
const AdminExecutionsPage = lazy(() =>
  import('@/pages/admin-executions').then((m) => ({ default: m.AdminExecutionsPage })),
)
const AdminNewsPage = lazy(() =>
  import('@/pages/admin-news').then((m) => ({ default: m.AdminNewsPage })),
)
const AdminGiftCodesPage = lazy(() =>
  import('@/pages/admin-gift-codes').then((m) => ({ default: m.AdminGiftCodesPage })),
)
const AdminWithdrawalsPage = lazy(() =>
  import('@/pages/admin-withdrawals').then((m) => ({ default: m.AdminWithdrawalsPage })),
)
const AdminSettingsPage = lazy(() =>
  import('@/pages/admin-settings').then((m) => ({ default: m.AdminSettingsPage })),
)

export function App() {
  return (
    <Suspense fallback={<Spinner />}>
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
    </Suspense>
  )
}

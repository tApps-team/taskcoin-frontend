import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAdmin, RequireAuth } from '@/features/auth'
import { AdminLoginPage } from '@/pages/admin-login'
import { AdminSettingsPage } from '@/pages/admin-settings'
import { AdminSubmissionsPage } from '@/pages/admin-submissions'
import { AdminTaskDetailsPage } from '@/pages/admin-task-details'
import { AdminTasksPage } from '@/pages/admin-tasks'
import { AdminUsersPage } from '@/pages/admin-users'
import { AdminWithdrawalsPage } from '@/pages/admin-withdrawals'
import { DashboardPage } from '@/pages/admin-dashboard'
import { ActivePage } from '@/pages/active'
import { HistoryPage } from '@/pages/history'
import { LoginPage } from '@/pages/login'
import { ProfilePage } from '@/pages/profile'
import { TaskDetailsPage } from '@/pages/task-details'
import { TasksPage } from '@/pages/tasks'
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
          <Route index element={<TasksPage />} />
          <Route path="tasks/:id" element={<TaskDetailsPage />} />
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
          <Route path="tasks" element={<AdminTasksPage />} />
          <Route path="tasks/:id" element={<AdminTaskDetailsPage />} />
          <Route path="submissions" element={<AdminSubmissionsPage />} />
          <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}

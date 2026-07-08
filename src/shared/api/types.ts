export type Role = 'user' | 'super_admin'

export type TaskStatus = 'draft' | 'active' | 'deactivated' | 'completed' | 'archived'
export type SubmissionStatus =
  | 'in_progress'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'expired'
export type WithdrawalStatus = 'pending' | 'paid' | 'rejected'

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: Role
  balance: string
  is_blocked: boolean
  created_at: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: User
}

export interface Category {
  id: string
  code: string
  title: string
  icon: string | null
}

export interface TaskCard {
  id: string
  title: string
  reward: string
  status: TaskStatus
  category: Category
}

// TipTap JSON document (loosely typed)
export type TipTapDoc = Record<string, unknown>

export interface TaskDetail {
  id: string
  title: string
  reward: string
  status: TaskStatus
  content: TipTapDoc
  required_screenshots: number
  time_limit_minutes: number
  max_completions: number | null
  completions_count: number
  category: Category
  created_at: string
}

export interface Screenshot {
  id: string
  file_path: string
  uploaded_at: string
}

export interface SubmissionTaskInfo {
  id: string
  title: string
  reward: string
}

export interface Submission {
  id: string
  task_id: string
  user_id: string
  status: SubmissionStatus
  started_at: string
  deadline_at: string
  submitted_at: string | null
  reviewed_at: string | null
  reviewer_comment: string | null
  reward_snapshot: string
  screenshots: Screenshot[]
  task: SubmissionTaskInfo
}

export interface AdminSubmission extends Submission {
  user: { id: string; email: string; full_name: string | null }
}

export interface Withdrawal {
  id: string
  user_id: string
  amount_coins: string
  amount_money: string
  currency: string
  card_number: string
  card_holder: string | null
  status: WithdrawalStatus
  admin_comment: string | null
  created_at: string
  processed_at: string | null
}

export interface AdminWithdrawal extends Withdrawal {
  user: { id: string; email: string; full_name: string | null }
}

export interface PublicSettings {
  coin_rate: string
  min_withdrawal_coins: string
  currency: string
}

export interface UserStats {
  total_earned: string
  completed_tasks: number
  balance: string
}

export interface DashboardStats {
  users_total: number
  users_blocked: number
  tasks_active: number
  submissions_pending: number
  withdrawals_pending: number
}

export interface Paginated<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

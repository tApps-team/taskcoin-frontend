export type Role = 'user' | 'super_admin'
export type Platform = 'ios' | 'android'
export type CampaignType = 'install' | 'install_review'
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived'
export type ExecutionStatus =
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
  platform: Platform | null
  country: string | null
  created_at: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: User
}

// ---- Applications & campaigns (admin) ----
export interface Application {
  id: string
  name: string
  platform: Platform
  store_url: string
  store_app_id: string | null
  icon_url: string | null
  notes: string | null
  created_at: string
}

export interface Keyword {
  id: string
  keyword: string
  daily_target: number
}

export interface Campaign {
  id: string
  type: CampaignType
  price: string
  daily_limit: number | null
  repeat_days: number
  requires_open: boolean
  requires_rating: boolean
  requires_review: boolean
  rating_instruction: string | null
  review_instruction: string | null
  allowed_countries: string[]
  status: CampaignStatus
  total_target: number | null
  completed_count: number
  created_at: string
  application: Application
  keywords: Keyword[]
  today_count: number
}

// ---- Offers (user feed) ----
export interface Offer {
  campaign_id: string
  application_name: string
  icon_url: string | null
  platform: Platform
  keyword: string | null
  price: string
  type: CampaignType
}

export interface OfferDetail extends Offer {
  store_url: string
  requires_open: boolean
  requires_rating: boolean
  requires_review: boolean
  rating_instruction: string | null
  review_instruction: string | null
}

// ---- Executions ----
export interface Screenshot {
  id: string
  file_path: string
  uploaded_at: string
}

export interface Execution {
  id: string
  campaign_id: string
  user_id: string
  status: ExecutionStatus
  started_at: string
  deadline_at: string
  submitted_at: string | null
  reviewed_at: string | null
  reviewer_comment: string | null
  reward_snapshot: string
  application_name: string
  icon_url: string | null
  keyword: string | null
  screenshots: Screenshot[]
}

export interface AdminExecution extends Execution {
  user: { id: string; email: string; full_name: string | null }
}

// ---- Gift codes & withdrawals ----
export interface Denomination {
  id: string
  label: string
  price_rub: string
  is_active: boolean
  sort: number
  available_count: number
}

export interface DenominationPublic {
  id: string
  label: string
  price_rub: string
  available: boolean
}

export interface Withdrawal {
  id: string
  user_id: string
  amount: string
  currency: string
  denomination_label: string | null
  status: WithdrawalStatus
  admin_comment: string | null
  created_at: string
  processed_at: string | null
  card_number: string | null
  card_code: string | null
}

export interface AdminWithdrawal {
  id: string
  user_id: string
  amount: string
  currency: string
  denomination_label: string | null
  status: WithdrawalStatus
  admin_comment: string | null
  created_at: string
  processed_at: string | null
  user: { id: string; email: string; full_name: string | null }
}

// ---- Misc ----
export interface PublicSettings {
  currency: string
  min_withdrawal: string
}

export interface UserStats {
  total_earned: string
  completed_installs: number
  balance: string
}

export interface GiftStockItem {
  label: string
  count: number
}

export interface DashboardStats {
  users_total: number
  users_active_today: number
  users_blocked: number
  campaigns_active: number
  executions_pending: number
  withdrawals_total: number
  installs_today: number
  total_balance: string
  users_above_threshold: number
  gift_stock: GiftStockItem[]
}

export type TipTapDoc = Record<string, unknown>

export interface NewsArticle {
  id: string
  title: string
  cover_url: string | null
  accent: string | null
  body: TipTapDoc
  is_published: boolean
  sort: number
  published_at: string | null
  created_at: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

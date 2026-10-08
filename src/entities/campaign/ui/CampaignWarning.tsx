import { AlertTriangle, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CampaignAvailability } from '@/shared/api/types'

// An active campaign can still be invisible to every user — most painfully when
// a "scheduled" daily limit has no entry for today, which nothing else in the
// CRM hints at. Surface that here instead of making admins open the campaign.
const SEVERE = new Set<CampaignAvailability['reason']>(['scheduled_gap'])

export function CampaignWarning({ availability }: { availability: CampaignAvailability | null }) {
  const { t } = useTranslation()
  if (!availability) return null

  const severe = SEVERE.has(availability.reason)
  const Icon = severe ? AlertTriangle : Clock

  return (
    <div
      className={`flex items-start gap-2 rounded-xl px-3 py-2 text-xs mb-2 ${
        severe
          ? 'bg-red-500/10 text-red-300 ring-1 ring-red-500/25'
          : 'bg-amber-400/10 text-amber-200/90 ring-1 ring-amber-400/20'
      }`}
    >
      <Icon className="size-4 shrink-0 mt-px" />
      <span>
        {t(`admin.campaigns.warnings.${availability.reason}`, {
          used: availability.used,
          limit: availability.limit ?? 0,
        })}
      </span>
    </div>
  )
}

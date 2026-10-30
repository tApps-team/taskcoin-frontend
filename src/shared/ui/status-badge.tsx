import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/utils'
import { Badge } from './badge'

// Per-status accent colors layered on top of the shadcn Badge.
const COLORS: Record<string, string> = {
  draft: 'bg-ink/[0.035] text-muted-foreground',
  active: 'bg-emerald-400/15 text-emerald-700',
  paused: 'bg-amber-400/15 text-amber-700',
  completed: 'bg-sky-400/15 text-sky-700',
  archived: 'bg-ink/[0.035] text-muted-foreground',
  in_progress: 'bg-brand-tint text-brand-greenDeep',
  submitted: 'bg-brand-green/15 text-brand-green',
  approved: 'bg-emerald-400/15 text-emerald-700',
  rejected: 'bg-red-400/15 text-red-600',
  expired: 'bg-ink/[0.035] text-muted-foreground',
  pending: 'bg-amber-400/15 text-amber-700',
  paid: 'bg-emerald-400/15 text-emerald-700',
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  return (
    <Badge variant="outline" className={cn('border-transparent', COLORS[status])}>
      {t(`statuses.${status}`)}
    </Badge>
  )
}

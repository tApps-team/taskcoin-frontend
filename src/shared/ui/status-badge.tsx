import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/utils'
import { Badge } from './badge'

// Per-status accent colors layered on top of the shadcn Badge.
const COLORS: Record<string, string> = {
  draft: 'bg-white/5 text-muted-foreground',
  active: 'bg-emerald-400/15 text-emerald-300',
  deactivated: 'bg-amber-400/15 text-amber-300',
  completed: 'bg-sky-400/15 text-sky-300',
  archived: 'bg-white/5 text-muted-foreground',
  in_progress: 'bg-brand-violet/20 text-brand-purple',
  submitted: 'bg-brand-teal/15 text-brand-teal',
  approved: 'bg-emerald-400/15 text-emerald-300',
  rejected: 'bg-red-400/15 text-red-300',
  expired: 'bg-white/5 text-muted-foreground',
  pending: 'bg-amber-400/15 text-amber-300',
  paid: 'bg-emerald-400/15 text-emerald-300',
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  return (
    <Badge variant="outline" className={cn('border-transparent', COLORS[status])}>
      {t(`statuses.${status}`)}
    </Badge>
  )
}

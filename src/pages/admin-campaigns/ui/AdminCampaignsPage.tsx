import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  useAdminDeleteCampaignMutation,
  useAdminGetCampaignsQuery,
  useAdminSetCampaignStatusMutation,
  type Campaign,
} from '@/entities/campaign'
import { CampaignModal } from '@/features/manage-campaigns'
import { Button, Card, CardContent, CoinAmount, EmptyState, SimpleSelect, Spinner, StatusBadge } from '@/shared/ui'

export function AdminCampaignsPage() {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState('')
  const { data, isLoading } = useAdminGetCampaignsQuery({ status: statusFilter || undefined, limit: 100 })
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Campaign | null>(null)
  const [setStatus] = useAdminSetCampaignStatusMutation()
  const [remove] = useAdminDeleteCampaignMutation()

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{t('admin.campaigns.title')}</h1>
        <div className="flex gap-2">
          <SimpleSelect
            className="w-40"
            value={statusFilter}
            onValueChange={setStatusFilter}
            placeholder={t('admin.campaigns.allStatuses')}
            options={[
              { value: '', label: t('admin.campaigns.allStatuses') },
              ...['draft', 'active', 'paused', 'completed', 'archived'].map((s) => ({
                value: s,
                label: t(`statuses.${s}`),
              })),
            ]}
          />
          <Button onClick={() => setCreating(true)}>
            <Plus /> {t('admin.campaigns.create')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState emoji="📣" text={t('admin.campaigns.empty')} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.items.map((c) => {
            const pct = c.total_target ? Math.min(100, Math.round((c.completed_count / c.total_target) * 100)) : null
            return (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {c.application.icon_url && (
                      <img src={c.application.icon_url} alt="" className="size-10 rounded-xl object-cover" />
                    )}
                    <Link to={`/admin/campaigns/${c.id}`} className="min-w-0 flex-1 hover:text-brand-teal">
                      <div className="font-semibold truncate">{c.application.name}</div>
                      <div className="text-xs text-muted-foreground uppercase">{c.application.platform}</div>
                    </Link>
                    <CoinAmount value={c.price} className="text-brand-teal font-bold" />
                    <StatusBadge status={c.status} />
                  </div>

                  <div className="text-sm text-muted-foreground mb-2">
                    {t('admin.campaigns.progress')}: {c.completed_count}
                    {c.total_target ? ` / ${c.total_target}` : ''} · {t('admin.campaigns.today')}: {c.today_count}
                  </div>
                  {pct !== null && (
                    <div className="h-2 rounded-full bg-white/10 mb-3 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-violet to-brand-teal" style={{ width: `${pct}%` }} />
                    </div>
                  )}

                  <div className="flex gap-1.5 flex-wrap">
                    <Button size="sm" variant="secondary" onClick={() => setEditing(c)}>
                      <Pencil className="size-3.5" /> {t('common.edit')}
                    </Button>
                    {c.status === 'active' ? (
                      <Button size="sm" variant="secondary" onClick={() => setStatus({ id: c.id, status: 'paused' })}>
                        {t('admin.campaigns.pause')}
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setStatus({ id: c.id, status: 'active' })}>
                        {t('admin.campaigns.activate')}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => confirm(t('admin.campaigns.confirmDelete')) && remove(c.id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {creating && <CampaignModal onClose={() => setCreating(false)} />}
      {editing && <CampaignModal campaign={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useAdminGetCampaignQuery } from '@/entities/campaign'
import { useAdminGetCampaignExecutionsQuery } from '@/entities/execution'
import { ExecutionCard } from '@/features/review-execution'
import {
  Card,
  CardContent,
  CoinAmount,
  EmptyState,
  Spinner,
  StatusBadge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui'

export function AdminCampaignDetailsPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const { data: c, isLoading } = useAdminGetCampaignQuery(id)
  const { data: execs } = useAdminGetCampaignExecutionsQuery({ campaignId: id })

  if (isLoading || !c) return <Spinner />

  return (
    <div>
      <Link to="/admin/campaigns" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-teal">
        <ArrowLeft className="size-4" /> {t('common.back')}
      </Link>

      <div className="flex items-center justify-between mt-2 mb-4 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{c.application.name}</h1>
        <div className="flex items-center gap-3">
          <CoinAmount value={c.price} className="text-brand-teal font-bold" />
          <StatusBadge status={c.status} />
        </div>
      </div>

      <Tabs defaultValue="executions">
        <TabsList className="mb-4">
          <TabsTrigger value="executions">{t('admin.campaigns.executionsTab')}</TabsTrigger>
          <TabsTrigger value="details">{t('admin.campaigns.detailsTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="executions">
          {!execs || execs.items.length === 0 ? (
            <EmptyState emoji="✅" text={t('admin.executions.empty')} />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {execs.items.map((e) => (
                <ExecutionCard key={e.id} execution={e} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardContent className="p-5 space-y-2 text-sm">
              <Row label={t('admin.campaigns.platform')} value={c.application.platform} />
              <Row label={t('admin.campaigns.type')} value={c.type} />
              <Row label={t('admin.campaigns.repeatDays')} value={String(c.repeat_days)} />
              <Row label={t('admin.campaigns.dailyLimit')} value={c.daily_limit ? String(c.daily_limit) : '∞'} />
              <Row label={t('admin.campaigns.totalTarget')} value={c.total_target ? String(c.total_target) : '∞'} />
              <Row label={t('admin.campaigns.progress')} value={`${c.completed_count} · ${t('admin.campaigns.today')}: ${c.today_count}`} />
              <Row label={t('admin.campaigns.countries')} value={c.allowed_countries.length ? c.allowed_countries.join(', ') : t('admin.campaigns.allCountries')} />
              <Row label={t('admin.campaigns.keywords')} value={c.keywords.map((k) => `${k.keyword} (${k.daily_target}/д)`).join(', ') || '—'} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}

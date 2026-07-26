import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminGetApplicationsQuery } from '@/entities/application'
import {
  useAdminCreateCampaignMutation,
  useAdminUpdateCampaignMutation,
  type Campaign,
} from '@/entities/campaign'
import { Button, Input, Label, Modal, SimpleSelect } from '@/shared/ui'

interface KeywordRow {
  keyword: string
  daily_target: number
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-brand-violet" />
      {label}
    </label>
  )
}

export function CampaignModal({ campaign, onClose }: { campaign?: Campaign | null; onClose: () => void }) {
  const { t } = useTranslation()
  const { data: apps } = useAdminGetApplicationsQuery()
  const [create, { isLoading: creating }] = useAdminCreateCampaignMutation()
  const [update, { isLoading: updating }] = useAdminUpdateCampaignMutation()

  const [applicationId, setApplicationId] = useState(campaign?.application.id || '')
  const [type, setType] = useState(campaign?.type || 'install')
  const [price, setPrice] = useState(campaign?.price || '10')
  const [dailyLimit, setDailyLimit] = useState(campaign?.daily_limit?.toString() || '')
  const [repeatDays, setRepeatDays] = useState(campaign?.repeat_days?.toString() || '3')
  const [totalTarget, setTotalTarget] = useState(campaign?.total_target?.toString() || '')
  const [requiresOpen, setRequiresOpen] = useState(campaign?.requires_open ?? true)
  const [requiresRating, setRequiresRating] = useState(campaign?.requires_rating ?? false)
  const [requiresReview, setRequiresReview] = useState(campaign?.requires_review ?? false)
  const [ratingInstruction, setRatingInstruction] = useState(campaign?.rating_instruction || '')
  const [reviewInstruction, setReviewInstruction] = useState(campaign?.review_instruction || '')
  const [countries, setCountries] = useState((campaign?.allowed_countries || []).join(', '))
  const [status, setStatus] = useState(campaign?.status || 'active')
  const [keywords, setKeywords] = useState<KeywordRow[]>(
    campaign?.keywords.map((k) => ({ keyword: k.keyword, daily_target: k.daily_target })) || [],
  )
  const [error, setError] = useState('')

  const setKw = (i: number, patch: Partial<KeywordRow>) =>
    setKeywords((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  const save = async () => {
    setError('')
    const body: Record<string, unknown> = {
      application_id: applicationId,
      type,
      price,
      daily_limit: dailyLimit ? Number(dailyLimit) : null,
      repeat_days: Number(repeatDays),
      total_target: totalTarget ? Number(totalTarget) : null,
      requires_open: requiresOpen,
      requires_rating: requiresRating,
      requires_review: requiresReview,
      rating_instruction: ratingInstruction || null,
      review_instruction: reviewInstruction || null,
      allowed_countries: countries
        .split(',')
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean),
      status,
      keywords: keywords.filter((k) => k.keyword.trim()),
    }
    try {
      if (campaign) await update({ id: campaign.id, body }).unwrap()
      else await create(body).unwrap()
      onClose()
    } catch (err) {
      setError((err as { data?: { detail?: string } })?.data?.detail || t('common.error'))
    }
  }

  return (
    <Modal title={campaign ? t('admin.campaigns.edit') : t('admin.campaigns.create')} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <Label>{t('admin.campaigns.application')}</Label>
          <SimpleSelect
            className="w-full"
            value={applicationId}
            onValueChange={setApplicationId}
            placeholder={t('admin.campaigns.selectApp')}
            options={(apps || []).map((a) => ({ value: a.id, label: `${a.name} (${a.platform})` }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t('admin.campaigns.type')}</Label>
            <SimpleSelect
              className="w-full"
              value={type}
              onValueChange={(v) => setType(v as 'install' | 'install_review')}
              options={[
                { value: 'install', label: t('admin.campaigns.typeInstall') },
                { value: 'install_review', label: t('admin.campaigns.typeReview') },
              ]}
            />
          </div>
          <div>
            <Label>{t('admin.campaigns.price')}</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>{t('admin.campaigns.dailyLimit')}</Label>
            <Input type="number" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} placeholder="∞" />
          </div>
          <div>
            <Label>{t('admin.campaigns.repeatDays')}</Label>
            <Input type="number" value={repeatDays} onChange={(e) => setRepeatDays(e.target.value)} />
          </div>
          <div>
            <Label>{t('admin.campaigns.totalTarget')}</Label>
            <Input type="number" value={totalTarget} onChange={(e) => setTotalTarget(e.target.value)} placeholder="∞" />
          </div>
        </div>

        <div>
          <Label>{t('admin.campaigns.countries')}</Label>
          <Input value={countries} onChange={(e) => setCountries(e.target.value)} placeholder="RU, BY (пусто = все)" />
        </div>

        <div className="space-y-2 border-t border-white/10 pt-3">
          <div className="font-semibold text-sm">{t('admin.campaigns.actions')}</div>
          <Check label={t('admin.campaigns.requiresOpen')} checked={requiresOpen} onChange={setRequiresOpen} />
          <Check label={t('admin.campaigns.requiresRating')} checked={requiresRating} onChange={setRequiresRating} />
          {requiresRating && (
            <Input value={ratingInstruction} onChange={(e) => setRatingInstruction(e.target.value)} placeholder={t('admin.campaigns.ratingHint')} />
          )}
          <Check label={t('admin.campaigns.requiresReview')} checked={requiresReview} onChange={setRequiresReview} />
          {requiresReview && (
            <Input value={reviewInstruction} onChange={(e) => setReviewInstruction(e.target.value)} placeholder={t('admin.campaigns.reviewHint')} />
          )}
        </div>

        <div className="space-y-2 border-t border-white/10 pt-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm">{t('admin.campaigns.keywords')}</div>
            <Button size="sm" variant="secondary" onClick={() => setKeywords((r) => [...r, { keyword: '', daily_target: 0 }])}>
              <Plus className="size-4" /> {t('admin.campaigns.addKeyword')}
            </Button>
          </div>
          {keywords.map((k, i) => (
            <div key={i} className="flex gap-2">
              <Input className="flex-1" value={k.keyword} onChange={(e) => setKw(i, { keyword: e.target.value })} placeholder={t('admin.campaigns.keyword')} />
              <Input className="w-24" type="number" value={k.daily_target} onChange={(e) => setKw(i, { daily_target: Number(e.target.value) })} placeholder="/день" />
              <Button size="icon" variant="destructive" onClick={() => setKeywords((r) => r.filter((_, idx) => idx !== i))}>
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <div>
          <Label>{t('admin.campaigns.status')}</Label>
          <SimpleSelect
            className="w-full"
            value={status}
            onValueChange={(v) => setStatus(v as Campaign['status'])}
            options={['draft', 'active', 'paused', 'completed', 'archived'].map((s) => ({
              value: s,
              label: t(`statuses.${s}`),
            }))}
          />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button className="w-full" disabled={creating || updating || !applicationId || !price} onClick={save}>
          {t('common.save')}
        </Button>
      </div>
    </Modal>
  )
}

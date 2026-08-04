import { Plus, Star, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminGetApplicationsQuery, useAdminUploadImageMutation } from '@/entities/application'
import {
  useAdminCreateCampaignMutation,
  useAdminUpdateCampaignMutation,
  type Campaign,
} from '@/entities/campaign'
import { getErrorMessage } from '@/shared/lib/errors'
import { Button, Input, Label, Modal, SimpleSelect, Textarea } from '@/shared/ui'

interface KeywordRow {
  keyword: string
  daily_target: number
}

const STARS = [1, 2, 3, 4, 5]

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
  const [uploadImage, { isLoading: uploadingInstruction }] = useAdminUploadImageMutation()

  const [applicationId, setApplicationId] = useState(campaign?.application.id || '')
  const [type, setType] = useState(campaign?.type || 'install')
  const [price, setPrice] = useState(campaign?.price || '10')
  const [dailyLimit, setDailyLimit] = useState(campaign?.daily_limit?.toString() || '')
  const [repeatDays, setRepeatDays] = useState(campaign?.repeat_days?.toString() || '3')
  const [totalTarget, setTotalTarget] = useState(campaign?.total_target?.toString() || '')
  const [requiresOpen, setRequiresOpen] = useState(campaign?.requires_open ?? true)
  const [requiresRating, setRequiresRating] = useState(campaign?.requires_rating ?? false)
  const [requiresReview, setRequiresReview] = useState(campaign?.requires_review ?? false)
  const [ratingWeights, setRatingWeights] = useState<Record<string, number>>(
    () => campaign?.rating_weights ?? {},
  )
  const [reviewInstruction, setReviewInstruction] = useState(campaign?.review_instruction || '')
  const [instructionText, setInstructionText] = useState(campaign?.instruction_text || '')
  const [instructionMedia, setInstructionMedia] = useState<string | null>(
    campaign?.instruction_media_url || null,
  )
  const [countries, setCountries] = useState((campaign?.allowed_countries || []).join(', '))
  const [status, setStatus] = useState(campaign?.status || 'active')
  const [keywords, setKeywords] = useState<KeywordRow[]>(
    campaign?.keywords.map((k) => ({ keyword: k.keyword, daily_target: k.daily_target })) || [],
  )
  const [error, setError] = useState('')

  const setKw = (i: number, patch: Partial<KeywordRow>) =>
    setKeywords((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  const setWeight = (star: number, value: string) =>
    setRatingWeights((w) => ({ ...w, [String(star)]: Math.max(0, Math.min(100, Number(value) || 0)) }))

  const onInstructionImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await uploadImage(form).unwrap()
      setInstructionMedia(res.url)
    } catch (err) {
      setError(getErrorMessage(err, t('common.error')))
    }
    e.target.value = ''
  }

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
      rating_weights: requiresRating ? ratingWeights : {},
      review_instruction: reviewInstruction || null,
      instruction_text: instructionText || null,
      instruction_media_url: instructionMedia,
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
      setError(getErrorMessage(err, t('common.error')))
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
            <Input
              type="number"
              step="0.5"
              min="0"
              value={repeatDays}
              onChange={(e) => setRepeatDays(e.target.value)}
              title={t('admin.campaigns.repeatDaysHint')}
            />
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
            <div className="pl-6 space-y-1.5">
              <p className="text-xs text-muted-foreground">{t('admin.campaigns.ratingWeightsHint')}</p>
              {STARS.map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-16 text-sm text-amber-400">
                    {star} <Star className="size-3.5 fill-current" />
                  </div>
                  <Input
                    className="w-24"
                    type="number"
                    min="0"
                    max="100"
                    value={ratingWeights[String(star)] ?? 0}
                    onChange={(e) => setWeight(star, e.target.value)}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              ))}
            </div>
          )}
          <Check label={t('admin.campaigns.requiresReview')} checked={requiresReview} onChange={setRequiresReview} />
          {requiresReview && (
            <Textarea value={reviewInstruction} onChange={(e) => setReviewInstruction(e.target.value)} placeholder={t('admin.campaigns.reviewHint')} />
          )}
        </div>

        <div className="space-y-2 border-t border-white/10 pt-3">
          <div className="font-semibold text-sm">{t('admin.campaigns.instruction')}</div>
          <p className="text-xs text-muted-foreground">{t('admin.campaigns.instructionHint')}</p>
          <div className="flex items-center gap-3">
            {instructionMedia && (
              <img src={instructionMedia} alt="" className="size-16 rounded-xl object-cover" />
            )}
            <label className="text-sm text-brand-teal cursor-pointer">
              {uploadingInstruction ? t('common.loading') : t('admin.campaigns.instructionImage')}
              <input type="file" accept="image/*" hidden onChange={onInstructionImage} />
            </label>
            {instructionMedia && (
              <button
                type="button"
                className="text-xs text-destructive"
                onClick={() => setInstructionMedia(null)}
              >
                {t('common.delete')}
              </button>
            )}
          </div>
          <Textarea
            value={instructionText}
            onChange={(e) => setInstructionText(e.target.value)}
            placeholder={t('admin.campaigns.instructionText')}
          />
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

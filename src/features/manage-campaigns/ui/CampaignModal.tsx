import { Plus, Star, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminGetApplicationsQuery, useAdminUploadImageMutation } from '@/entities/application'
import {
  useAdminCreateCampaignMutation,
  useAdminUpdateCampaignMutation,
  type Campaign,
} from '@/entities/campaign'
import {
  useGetStandardInstructionQuery,
  type StandardInstruction,
} from '@/entities/standard-instruction'
import { getErrorMessage } from '@/shared/lib/errors'
import { Button, Input, Label, Modal, SimpleSelect, Textarea } from '@/shared/ui'
import { PercentSliders } from './PercentSliders'

interface KeywordRow {
  keyword: string
  percent: number
}

const STARS = [1, 2, 3, 4, 5]

// daily_schedule keys are Moscow (UTC+3) calendar dates, matching the backend.
const MSK_FMT = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow' }) // YYYY-MM-DD
const mskToday = () => MSK_FMT.format(new Date())
// Add days to a YYYY-MM-DD key (noon UTC avoids any boundary drift).
const addDaysKey = (key: string, n: number) => {
  const d = new Date(`${key}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
const fmtDay = (key: string) => key.split('-').reverse().join('-') // dd-mm-yyyy

function nextDays(n: number): string[] {
  const out: string[] = []
  let key = mskToday()
  for (let i = 0; i < n; i++) {
    out.push(key)
    key = addDaysKey(key, 1)
  }
  return out
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-brand-violet" />
      {label}
    </label>
  )
}

function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="radio" checked={checked} onChange={onChange} className="size-4 accent-brand-violet" />
      {label}
    </label>
  )
}

// One instruction slot (main / review / rating): standard-or-unique toggle,
// standard preview (chosen by platform outside), or a unique image + text editor.
function InstructionBlock({
  title,
  useStandard,
  onStandard,
  preview,
  media,
  onMedia,
  onUpload,
  uploading,
  text,
  onText,
}: {
  title: string
  useStandard: boolean
  onStandard: (v: boolean) => void
  preview: StandardInstruction | undefined
  media: string | null
  onMedia: (url: string | null) => void
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => void
  uploading: boolean
  text: string
  onText: (v: string) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-2">
      <div className="font-semibold text-sm">{title}</div>
      <Radio label={t('admin.campaigns.instructionStandard')} checked={useStandard} onChange={() => onStandard(true)} />
      <Radio label={t('admin.campaigns.instructionUnique')} checked={!useStandard} onChange={() => onStandard(false)} />
      {useStandard ? (
        <div className="glass-soft rounded-xl p-3">
          {preview?.media_url && (
            <img src={preview.media_url} alt="" className="w-full rounded-lg mb-2 object-cover max-h-48" />
          )}
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {preview?.text || t('admin.campaigns.instructionStandardEmpty')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {media && <img src={media} alt="" className="size-16 rounded-xl object-cover" />}
            <label className="text-sm text-brand-teal cursor-pointer">
              {uploading ? t('common.loading') : t('admin.campaigns.instructionImage')}
              <input type="file" accept="image/*" hidden onChange={(e) => onUpload(e, onMedia)} />
            </label>
            {media && (
              <button type="button" className="text-xs text-destructive" onClick={() => onMedia(null)}>
                {t('common.delete')}
              </button>
            )}
          </div>
          <Textarea value={text} onChange={(e) => onText(e.target.value)} placeholder={t('admin.campaigns.instructionText')} />
        </div>
      )}
    </div>
  )
}

export function CampaignModal({ campaign, onClose }: { campaign?: Campaign | null; onClose: () => void }) {
  const { t } = useTranslation()
  const { data: apps } = useAdminGetApplicationsQuery()
  const { data: standardInstruction } = useGetStandardInstructionQuery()
  const [create, { isLoading: creating }] = useAdminCreateCampaignMutation()
  const [update, { isLoading: updating }] = useAdminUpdateCampaignMutation()
  const [uploadImage, { isLoading: uploadingInstruction }] = useAdminUploadImageMutation()

  const [applicationId, setApplicationId] = useState(campaign?.application.id || '')
  const [type, setType] = useState(campaign?.type || 'install')
  const [price, setPrice] = useState(campaign?.price || '10')
  const [hourlyLimit, setHourlyLimit] = useState(campaign?.hourly_limit?.toString() || '')
  const [dailyMode, setDailyMode] = useState<'constant' | 'scheduled'>(campaign?.daily_limit_mode || 'constant')
  const [dailyLimit, setDailyLimit] = useState(campaign?.daily_limit?.toString() || '')
  const [schedule, setSchedule] = useState<Record<string, number>>(() => campaign?.daily_schedule ?? {})
  const [totalTarget, setTotalTarget] = useState(campaign?.total_target?.toString() || '')
  const [requiresOpen, setRequiresOpen] = useState(campaign?.requires_open ?? true)
  const [requiresRating, setRequiresRating] = useState(campaign?.requires_rating ?? false)
  const [requiresReview, setRequiresReview] = useState(campaign?.requires_review ?? false)
  const [ratingWeights, setRatingWeights] = useState<Record<string, number>>(() => {
    const w = campaign?.rating_weights ?? {}
    return Object.fromEntries(STARS.map((s) => [String(s), w[String(s)] ?? 0]))
  })
  // Main-screen screenshot instruction
  const [useStandard, setUseStandard] = useState(campaign?.use_standard_instruction ?? true)
  const [instructionText, setInstructionText] = useState(campaign?.instruction_text || '')
  const [instructionMedia, setInstructionMedia] = useState<string | null>(campaign?.instruction_media_url || null)
  // Review screenshot instruction (reviewInstruction = unique text)
  const [useStandardReview, setUseStandardReview] = useState(campaign?.use_standard_review_instruction ?? true)
  const [reviewInstruction, setReviewInstruction] = useState(campaign?.review_instruction || '')
  const [reviewMedia, setReviewMedia] = useState<string | null>(campaign?.review_instruction_media_url || null)
  // Rating screenshot instruction
  const [useStandardRating, setUseStandardRating] = useState(campaign?.use_standard_rating_instruction ?? true)
  const [ratingInstructionText, setRatingInstructionText] = useState(campaign?.rating_instruction_text || '')
  const [ratingMedia, setRatingMedia] = useState<string | null>(campaign?.rating_instruction_media_url || null)
  const [countries, setCountries] = useState((campaign?.allowed_countries || []).join(', '))
  const [status, setStatus] = useState(campaign?.status || 'active')
  const [keywords, setKeywords] = useState<KeywordRow[]>(
    campaign?.keywords.map((k) => ({ keyword: k.keyword, percent: k.percent })) || [],
  )
  const [error, setError] = useState('')

  const setKw = (i: number, patch: Partial<KeywordRow>) =>
    setKeywords((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  const addKeyword = () =>
    setKeywords((rows) => {
      const next = [...rows, { keyword: '', percent: 0 }]
      const even = Math.floor(100 / next.length)
      return next.map((r, i) => ({ ...r, percent: i === next.length - 1 ? 100 - even * (next.length - 1) : even }))
    })

  const removeKeyword = (i: number) =>
    setKeywords((rows) => {
      const next = rows.filter((_, idx) => idx !== i)
      if (next.length === 0) return next
      const even = Math.floor(100 / next.length)
      return next.map((r, idx) => ({ ...r, percent: idx === next.length - 1 ? 100 - even * (next.length - 1) : even }))
    })

  // Scheduled daily limit
  const scheduleDays = Object.keys(schedule).sort()
  const initScheduled = () => {
    if (Object.keys(schedule).length === 0) {
      setSchedule(Object.fromEntries(nextDays(5).map((k) => [k, 0])))
    }
    setDailyMode('scheduled')
  }
  const setDayLimit = (key: string, val: string) =>
    setSchedule((s) => ({ ...s, [key]: Math.max(0, Number(val) || 0) }))
  const removeDay = (key: string) =>
    setSchedule((s) => {
      const next = { ...s }
      delete next[key]
      return next
    })
  const addDay = () =>
    setSchedule((s) => {
      const keys = Object.keys(s).sort()
      const next = keys.length ? addDaysKey(keys[keys.length - 1], 1) : mskToday()
      return { ...s, [next]: 0 }
    })

  // Upload one image and hand the resulting URL to the given setter.
  const uploadOne = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await uploadImage(form).unwrap()
      setter(res.url)
    } catch (err) {
      setError(getErrorMessage(err, t('common.error')))
    }
    e.target.value = ''
  }

  // Standard instruction preview depends on the selected app's platform.
  const platform = (apps || []).find((a) => a.id === applicationId)?.platform
  const stdReview = platform === 'ios' ? standardInstruction?.review_ios : standardInstruction?.review_android
  const stdRating = platform === 'ios' ? standardInstruction?.rating_ios : standardInstruction?.rating_android

  const save = async () => {
    setError('')
    // Rating/review only apply to "Установка + отзыв/оценка"; drop them otherwise.
    const withActions = type === 'install_review'
    const rating = withActions && requiresRating
    const review = withActions && requiresReview
    const body: Record<string, unknown> = {
      application_id: applicationId,
      type,
      price,
      hourly_limit: hourlyLimit ? Number(hourlyLimit) : null,
      daily_limit_mode: dailyMode,
      daily_limit: dailyMode === 'constant' && dailyLimit ? Number(dailyLimit) : null,
      daily_schedule: dailyMode === 'scheduled' ? schedule : {},
      total_target: totalTarget ? Number(totalTarget) : null,
      requires_open: requiresOpen,
      requires_rating: rating,
      requires_review: review,
      rating_weights: rating ? ratingWeights : {},
      use_standard_instruction: useStandard,
      instruction_text: useStandard ? null : instructionText || null,
      instruction_media_url: useStandard ? null : instructionMedia,
      use_standard_review_instruction: useStandardReview,
      review_instruction: review && !useStandardReview ? reviewInstruction || null : null,
      review_instruction_media_url: review && !useStandardReview ? reviewMedia : null,
      use_standard_rating_instruction: useStandardRating,
      rating_instruction_text: rating && !useStandardRating ? ratingInstructionText || null : null,
      rating_instruction_media_url: rating && !useStandardRating ? ratingMedia : null,
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t('admin.campaigns.hourlyLimit')}</Label>
            <Input type="number" value={hourlyLimit} onChange={(e) => setHourlyLimit(e.target.value)} placeholder="∞" />
          </div>
          <div>
            <Label>{t('admin.campaigns.totalTarget')}</Label>
            <Input type="number" value={totalTarget} onChange={(e) => setTotalTarget(e.target.value)} placeholder="∞" />
          </div>
        </div>

        {/* Daily limit: constant vs scheduled */}
        <div className="space-y-2 border-t border-white/10 pt-3">
          <div className="font-semibold text-sm">{t('admin.campaigns.dailyLimit')}</div>
          <div className="flex gap-4">
            <Radio label={t('admin.campaigns.dailyConstant')} checked={dailyMode === 'constant'} onChange={() => setDailyMode('constant')} />
            <Radio label={t('admin.campaigns.dailyScheduled')} checked={dailyMode === 'scheduled'} onChange={initScheduled} />
          </div>
          {dailyMode === 'constant' ? (
            <Input type="number" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} placeholder="∞" />
          ) : (
            <div className="space-y-2">
              {scheduleDays.map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-28 shrink-0 text-sm font-mono">{fmtDay(key)}</div>
                  <Input type="number" className="flex-1" value={schedule[key]} onChange={(e) => setDayLimit(key, e.target.value)} placeholder="лимит" />
                  <Button size="icon" variant="secondary" onClick={() => removeDay(key)} aria-label={t('common.delete')}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="secondary" onClick={addDay}>
                <Plus className="size-4" /> {t('admin.campaigns.addDay')}
              </Button>
            </div>
          )}
        </div>

        <div>
          <Label>{t('admin.campaigns.countries')}</Label>
          <Input value={countries} onChange={(e) => setCountries(e.target.value)} placeholder="RU, BY (пусто = все)" />
        </div>

        <div className="space-y-2 border-t border-white/10 pt-3">
          <div className="font-semibold text-sm">{t('admin.campaigns.actions')}</div>
          <Check label={t('admin.campaigns.requiresOpen')} checked={requiresOpen} onChange={setRequiresOpen} />
          {/* Rating/review actions apply only to "Установка + отзыв/оценка" campaigns. */}
          {type === 'install_review' && (
            <>
              <Check label={t('admin.campaigns.requiresRating')} checked={requiresRating} onChange={setRequiresRating} />
              {requiresRating && (
                <div className="pl-6 space-y-2">
                  <p className="text-xs text-muted-foreground">{t('admin.campaigns.ratingWeightsHint')}</p>
                  <PercentSliders
                    items={STARS.map((s) => ({
                      key: String(s),
                      label: (
                        <span className="flex items-center gap-1 text-amber-400">
                          {s} <Star className="size-3.5 fill-current" />
                        </span>
                      ),
                    }))}
                    values={ratingWeights}
                    onChange={setRatingWeights}
                  />
                  <InstructionBlock
                    title={t('admin.campaigns.ratingInstructionTitle')}
                    useStandard={useStandardRating}
                    onStandard={setUseStandardRating}
                    preview={stdRating}
                    media={ratingMedia}
                    onMedia={setRatingMedia}
                    onUpload={uploadOne}
                    uploading={uploadingInstruction}
                    text={ratingInstructionText}
                    onText={setRatingInstructionText}
                  />
                </div>
              )}
              <Check label={t('admin.campaigns.requiresReview')} checked={requiresReview} onChange={setRequiresReview} />
              {requiresReview && (
                <div className="pl-6">
                  <InstructionBlock
                    title={t('admin.campaigns.reviewInstructionTitle')}
                    useStandard={useStandardReview}
                    onStandard={setUseStandardReview}
                    preview={stdReview}
                    media={reviewMedia}
                    onMedia={setReviewMedia}
                    onUpload={uploadOne}
                    uploading={uploadingInstruction}
                    text={reviewInstruction}
                    onText={setReviewInstruction}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Keywords by percent */}
        <div className="space-y-2 border-t border-white/10 pt-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm">{t('admin.campaigns.keywords')}</div>
            <Button size="sm" variant="secondary" onClick={addKeyword}>
              <Plus className="size-4" /> {t('admin.campaigns.addKeyword')}
            </Button>
          </div>
          {keywords.length > 0 && (
            <p className="text-xs text-muted-foreground">{t('admin.campaigns.keywordsPercentHint')}</p>
          )}
          {keywords.map((k, i) => (
            <div key={i} className="flex gap-2">
              <Input className="flex-1" value={k.keyword} onChange={(e) => setKw(i, { keyword: e.target.value })} placeholder={t('admin.campaigns.keyword')} />
              <div className="w-14 shrink-0 flex items-center justify-center text-sm font-mono text-muted-foreground">
                {keywords.length === 1 ? 100 : k.percent}%
              </div>
              <Button size="icon" variant="destructive" onClick={() => removeKeyword(i)}>
                <X className="size-4" />
              </Button>
            </div>
          ))}
          {keywords.length > 1 && (
            <PercentSliders
              items={keywords.map((k, i) => ({ key: String(i), label: k.keyword || `${t('admin.campaigns.keyword')} ${i + 1}` }))}
              values={Object.fromEntries(keywords.map((k, i) => [String(i), k.percent]))}
              onChange={(v) => setKeywords((rows) => rows.map((r, i) => ({ ...r, percent: v[String(i)] ?? 0 })))}
            />
          )}
        </div>

        {/* Main-screen screenshot instruction: standard vs unique */}
        <div className="border-t border-white/10 pt-3">
          <InstructionBlock
            title={t('admin.campaigns.instructionMainTitle')}
            useStandard={useStandard}
            onStandard={setUseStandard}
            preview={standardInstruction?.main}
            media={instructionMedia}
            onMedia={setInstructionMedia}
            onUpload={uploadOne}
            uploading={uploadingInstruction}
            text={instructionText}
            onText={setInstructionText}
          />
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

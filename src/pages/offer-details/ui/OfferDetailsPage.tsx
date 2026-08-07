import { ArrowLeft, Check, Copy, ExternalLink, Loader2, MessageSquare, Send, Smartphone, Star } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useGetMyExecutionsQuery, useSubmitExecutionMutation, type Execution } from '@/entities/execution'
import { useGetOfferQuery, useStartOfferMutation } from '@/entities/offer'
import { ScreenshotSlot } from '@/features/offer-work'
import type { OfferDetail, ScreenshotKind } from '@/shared/api/types'
import { getErrorMessage } from '@/shared/lib/errors'
import { storeHomeUrl } from '@/shared/lib/store'
import { useCountdown } from '@/shared/lib/useCountdown'
import { Button, Card, CardContent, CoinAmount, Spinner, StatusBadge } from '@/shared/ui'

const INSTALL_MS = 30000 // ceremony "launch the app" wait
const GATE_MS = 15000 // per-slot "do the action, then upload" wait

type Stage = 'copy' | 'store' | 'installing' | 'work'

// --- Flow state persistence -------------------------------------------------
// The staged flow (copy → store → install → per-slot uploads) is driven partly
// in-memory. We persist the current stage, the install wait deadline, and each
// slot's 15s reveal deadline per campaign so leaving/returning resumes exactly
// where the user left off. Which slots are already uploaded is derived from the
// execution's screenshots (server-side), so upload progress always survives.
interface FlowState {
  stage: Stage
  deadline: number | null // wall-clock ms for the install wait
  gates: Record<string, number> // per-slot 15s reveal deadlines (kind → ms)
}

const flowKey = (campaignId: string) => `taskcoin-offer-flow-${campaignId}`

function loadFlow(campaignId: string): FlowState | null {
  try {
    const raw = localStorage.getItem(flowKey(campaignId))
    const parsed = raw ? JSON.parse(raw) : null
    if (!parsed || typeof parsed.stage !== 'string') return null
    return { stage: parsed.stage, deadline: parsed.deadline ?? null, gates: parsed.gates ?? {} }
  } catch {
    return null
  }
}

function saveFlow(campaignId: string, state: FlowState) {
  try {
    localStorage.setItem(flowKey(campaignId), JSON.stringify(state))
  } catch {
    /* storage unavailable — flow just won't persist */
  }
}

// Wall-clock timer: fires once `deadline` (an absolute ms timestamp) is reached
// in REAL time, even if the tab was backgrounded (mobile browsers freeze JS
// timers when the user leaves for the store). We re-check on an interval and
// when the tab becomes visible again, so time spent away still counts.
function useDeadlineTimer(deadline: number | null, onDone: () => void) {
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  useEffect(() => {
    if (deadline == null) return
    const check = () => {
      if (Date.now() >= deadline) doneRef.current()
    }
    check()
    const id = setInterval(check, 1000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [deadline])
}

export function OfferDetailsPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const { data: offer, isLoading } = useGetOfferQuery(id)
  const { data: mine, isLoading: mineLoading } = useGetMyExecutionsQuery({ limit: 100 })

  if (isLoading || mineLoading) return <Spinner />
  if (!offer) return <div className="text-muted-foreground">{t('offer.notFound')}</div>

  const execution = mine?.items.find(
    (e) => e.campaign_id === id && ['in_progress', 'submitted'].includes(e.status),
  )

  return (
    <div>
      <Link to="/app" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-teal">
        <ArrowLeft className="size-4" /> {t('common.back')}
      </Link>

      <Card className="mt-2 mb-4">
        <CardContent className="p-5 flex items-center gap-3">
          {offer.icon_url ? (
            <img src={offer.icon_url} alt="" className="size-16 rounded-2xl object-cover" />
          ) : (
            <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <Smartphone className="size-8 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <div className="font-bold text-lg truncate">{offer.application_name}</div>
            <div className="text-xs text-muted-foreground uppercase">{offer.platform}</div>
          </div>
          <CoinAmount value={offer.price} className="ml-auto text-brand-teal font-bold text-lg" />
        </CardContent>
      </Card>

      {execution?.status === 'submitted' ? (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-muted-foreground">{t('offer.onReview')}</span>
            <StatusBadge status="submitted" />
          </CardContent>
        </Card>
      ) : (
        <OfferFlow offer={offer} campaignId={id} execution={execution} />
      )}
    </div>
  )
}

function storeName(platform: OfferDetail['platform']): string {
  return platform === 'ios' ? 'App Store' : 'Play Market'
}

function OfferFlow({
  offer,
  campaignId,
  execution,
}: {
  offer: OfferDetail
  campaignId: string
  execution?: Execution
}) {
  const { t } = useTranslation()
  const [start] = useStartOfferMutation()
  const [submit, { isLoading: submitting }] = useSubmitExecutionMutation()
  const { expired } = useCountdown(execution?.deadline_at ?? new Date().toISOString())
  const hasActions = offer.requires_rating || offer.requires_review

  // Whole flow state in one object so every change persists atomically.
  const [flow, setFlow] = useState<FlowState>(() => {
    if (!execution) return { stage: 'copy', deadline: null, gates: {} }
    const saved = loadFlow(campaignId)
    if (saved) return saved
    // Taken in a previous session with no saved flow: resume by progress.
    return { stage: execution.screenshots.length ? 'work' : 'store', deadline: null, gates: {} }
  })
  const [copied, setCopied] = useState(() => !!execution)
  const [error, setError] = useState('')

  const update = useCallback(
    (patch: Partial<FlowState>) =>
      setFlow((f) => {
        const next = { ...f, ...patch }
        saveFlow(campaignId, next)
        return next
      }),
    [campaignId],
  )

  const go = useCallback(
    (next: Stage) =>
      update({ stage: next, deadline: next === 'installing' ? Date.now() + INSTALL_MS : null }),
    [update],
  )

  // Start a slot's 15s reveal timer once (idempotent).
  const armGate = useCallback(
    (kind: string) =>
      setFlow((f) => {
        if (f.gates[kind]) return f
        const next = { ...f, gates: { ...f.gates, [kind]: Date.now() + GATE_MS } }
        saveFlow(campaignId, next)
        return next
      }),
    [campaignId],
  )

  // Install wait → move to the per-slot work stage.
  useDeadlineTimer(flow.stage === 'installing' ? flow.deadline : null, () => go('work'))

  const onCopy = async () => {
    setError('')
    if (offer.keyword) navigator.clipboard?.writeText(offer.keyword)
    setCopied(true)
    try {
      if (!execution) await start({ campaignId }).unwrap()
      go('store')
    } catch (e) {
      setCopied(false)
      setError(getErrorMessage(e, t('common.error')))
    }
  }

  const onSubmit = async () => {
    if (!execution) return
    setError('')
    try {
      await submit(execution.id).unwrap()
    } catch (e) {
      setError(getErrorMessage(e, t('common.error')))
    }
  }

  // ---- Ceremony (steps 1–3) ----
  if (flow.stage === 'copy' || flow.stage === 'store' || flow.stage === 'installing') {
    const stage = flow.stage
    const step2State: StepState = stage === 'copy' ? 'locked' : stage === 'store' ? 'active' : 'done'
    const step3State: StepState = stage === 'installing' ? 'active' : 'locked'

    return (
      <Card>
        <CardContent className="p-5">
          <div className="font-bold text-lg mb-4">{t('offer.flow.title')}</div>

          <Step index={1} state={stage === 'copy' ? 'active' : 'done'} title={t('offer.flow.step1')}>
            <Button variant={stage === 'copy' ? 'teal' : 'secondary'} disabled={stage !== 'copy'} onClick={onCopy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? t('offer.flow.copied') : t('offer.flow.copy')}
            </Button>
            {offer.keyword && <div className="mt-2 text-sm font-mono text-muted-foreground">{offer.keyword}</div>}
          </Step>

          <Step index={2} state={step2State} title={t('offer.flow.step2', { store: storeName(offer.platform) })}>
            {offer.icon_url && (
              <img src={offer.icon_url} alt="" className="size-12 rounded-xl object-cover mb-2" />
            )}
            {stage === 'store' ? (
              <Button asChild variant="teal">
                <a
                  href={storeHomeUrl(offer.platform)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => go('installing')}
                >
                  <ExternalLink className="size-4" /> {t('offer.flow.goStore', { store: storeName(offer.platform) })}
                </a>
              </Button>
            ) : (
              <Button variant="teal" disabled>
                <ExternalLink className="size-4" /> {t('offer.flow.goStore', { store: storeName(offer.platform) })}
              </Button>
            )}
          </Step>

          <Step index={3} state={step3State} title={t('offer.flow.step3')} last />

          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        </CardContent>
      </Card>
    )
  }

  // ---- Work stage: sequential per-slot upload plan ----
  return (
    <WorkStage
      offer={offer}
      execution={execution}
      gates={flow.gates}
      armGate={armGate}
      hasActions={hasActions}
      submitting={submitting}
      expired={expired}
      onSubmit={onSubmit}
      error={error}
    />
  )
}

// The three upload slots in order. `main` is always present; review/rating are
// added when the campaign requires them and precede the main-screen shot.
function slotOrder(offer: OfferDetail): ScreenshotKind[] {
  const steps: ScreenshotKind[] = []
  if (offer.requires_review) steps.push('review')
  if (offer.requires_rating) steps.push('rating')
  steps.push('main')
  return steps
}

function WorkStage({
  offer,
  execution,
  gates,
  armGate,
  hasActions,
  submitting,
  expired,
  onSubmit,
  error,
}: {
  offer: OfferDetail
  execution?: Execution
  gates: Record<string, number>
  armGate: (kind: string) => void
  hasActions: boolean
  submitting: boolean
  expired: boolean
  onSubmit: () => void
  error: string
}) {
  const { t } = useTranslation()
  const steps = slotOrder(offer)

  const has = (kind: ScreenshotKind) => !!execution?.screenshots.some((s) => s.kind === kind)
  const currentIndex = steps.findIndex((k) => !has(k))
  const allDone = currentIndex === -1
  const currentKind = allDone ? null : steps[currentIndex]

  // A slot's upload input is gated behind a 15s "do the action" wait — except
  // the main-screen shot on install-only tasks, which shows immediately.
  const isGated = (kind: ScreenshotKind) => kind !== 'main' || hasActions
  const gateOf = currentKind && isGated(currentKind) ? gates[currentKind] ?? null : null

  // Re-render when the gate elapses so the upload input reveals.
  const [, tick] = useState(0)
  useDeadlineTimer(gateOf, () => tick((x) => x + 1))

  // Arm the current slot's gate when it becomes active.
  useEffect(() => {
    if (currentKind && isGated(currentKind) && !gates[currentKind]) armGate(currentKind)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKind])

  const revealed = (kind: ScreenshotKind) =>
    !isGated(kind) || (!!gates[kind] && Date.now() >= gates[kind])

  const heading = (kind: ScreenshotKind) => {
    if (kind === 'review')
      return (
        <div className="flex items-center gap-2 font-semibold text-sm">
          <MessageSquare className="size-4 text-brand-teal shrink-0" /> {t('offer.flow.reviewTitle')}
        </div>
      )
    if (kind === 'rating')
      return (
        <div className="flex items-center gap-2 font-semibold text-sm">
          <span className="flex text-amber-400">
            {Array.from({ length: execution?.assigned_rating ?? 0 }).map((_, i) => (
              <Star key={i} className="size-4 fill-current" />
            ))}
          </span>
          {t('offer.flow.rate', { rating: execution?.assigned_rating ?? '' })}
        </div>
      )
    return <div className="font-semibold text-sm">{t('offer.flow.mainTitle')}</div>
  }

  const instruction = (kind: ScreenshotKind): { media: string | null; text: string | null } => {
    if (kind === 'review')
      return { media: offer.review_instruction_media_url, text: offer.review_instruction_text }
    if (kind === 'rating')
      return { media: offer.rating_instruction_media_url, text: offer.rating_instruction_text }
    return { media: offer.instruction_media_url, text: offer.instruction_text }
  }

  const placeholder = (kind: ScreenshotKind) =>
    kind === 'review'
      ? t('offer.flow.uploadReview')
      : kind === 'rating'
        ? t('offer.flow.uploadRating')
        : t('offer.flow.uploadMain')

  return (
    <div className="space-y-4">
      {steps
        .filter((kind) => has(kind) || kind === currentKind)
        .map((kind) => {
          const done = has(kind)
          const instr = instruction(kind)
          return (
            <Card key={kind}>
              <CardContent className="p-4 space-y-3">
                {heading(kind)}
                {done ? (
                  execution && <ScreenshotSlot execution={execution} kind={kind} placeholder={placeholder(kind)} />
                ) : (
                  <>
                    {(instr.media || instr.text) && (
                      <div>
                        {instr.media && (
                          <img src={instr.media} alt="" className="w-full rounded-xl mb-2 object-cover max-h-72" />
                        )}
                        {instr.text && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{instr.text}</p>
                        )}
                      </div>
                    )}
                    {revealed(kind) ? (
                      execution && (
                        <ScreenshotSlot execution={execution} kind={kind} placeholder={placeholder(kind)} />
                      )
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin shrink-0" /> {t('offer.flow.doTaskReturn')}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {allDone && (
        <Button variant="teal" className="w-full" disabled={submitting || expired} onClick={onSubmit}>
          <Send className="size-4" /> {t('offer.submit')}
        </Button>
      )}
    </div>
  )
}

type StepState = 'locked' | 'active' | 'done'

function Step({
  index,
  state,
  title,
  children,
  last,
}: {
  index: number
  state: StepState
  title: string
  children?: React.ReactNode
  last?: boolean
}) {
  const active = state === 'active'
  const done = state === 'done'
  return (
    <div className={`flex gap-3 ${last ? '' : 'pb-4'} ${state === 'locked' ? 'opacity-40' : ''}`}>
      <div className="flex flex-col items-center">
        <div
          className={`size-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
            active || done ? 'bg-brand-violet text-white' : 'bg-white/10 text-muted-foreground'
          }`}
        >
          {done ? <Check className="size-4" /> : index}
        </div>
        {!last && <div className="w-px flex-1 bg-white/10 my-1" />}
      </div>
      <div className="flex-1 min-w-0 pb-1">
        <div className={`text-sm mb-2 ${active ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
          {title}
        </div>
        {(active || (state !== 'locked' && children)) && children}
      </div>
    </div>
  )
}

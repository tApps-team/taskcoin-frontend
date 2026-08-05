import { ArrowLeft, Check, Copy, ExternalLink, Loader2, MessageSquare, Smartphone, Star } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useGetMyExecutionsQuery, type Execution } from '@/entities/execution'
import { useGetOfferQuery, useStartOfferMutation } from '@/entities/offer'
import { OfferWork } from '@/features/offer-work'
import type { OfferDetail } from '@/shared/api/types'
import { getErrorMessage } from '@/shared/lib/errors'
import { storeHomeUrl } from '@/shared/lib/store'
import { Button, Card, CardContent, CoinAmount, Spinner, StatusBadge } from '@/shared/ui'

const WAIT_MS = 60000

type Stage = 'copy' | 'store' | 'installing' | 'actions' | 'screenshot'

// --- Ceremony state persistence ---------------------------------------------
// The step-by-step flow (copy → store → wait → screenshot) lives in-memory, so
// leaving the page used to reset it — a user who took the task (clicked "copy")
// and came back via "Активные" jumped straight to the final screenshot form.
// We persist the current stage + the running timer deadline per campaign so the
// flow resumes exactly where the user left off.
interface FlowState {
  stage: Stage
  deadline: number | null // wall-clock ms for the running installing/actions wait
}

const flowKey = (campaignId: string) => `taskcoin-offer-flow-${campaignId}`

function loadFlow(campaignId: string): FlowState | null {
  try {
    const raw = localStorage.getItem(flowKey(campaignId))
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed.stage === 'string' ? parsed : null
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
  const hasActions = offer.requires_rating || offer.requires_review

  // Resume the saved ceremony if the task is already taken; otherwise start
  // fresh. A taken task without saved state (e.g. an older session) resumes at
  // the "go to store" step rather than jumping to the final form.
  const [stage, setStageRaw] = useState<Stage>(() =>
    execution ? (loadFlow(campaignId)?.stage ?? 'store') : 'copy',
  )
  const [deadline, setDeadline] = useState<number | null>(() =>
    execution ? (loadFlow(campaignId)?.deadline ?? null) : null,
  )
  const [copied, setCopied] = useState(() => !!execution)
  const [error, setError] = useState('')

  // Move to a stage and persist it (+ a fresh deadline for timed waits).
  const go = useCallback(
    (next: Stage) => {
      const dl = next === 'installing' || next === 'actions' ? Date.now() + WAIT_MS : null
      setStageRaw(next)
      setDeadline(dl)
      saveFlow(campaignId, { stage: next, deadline: dl })
    },
    [campaignId],
  )

  // Single timer for whichever wait stage is active; advances via `go`.
  useDeadlineTimer(stage === 'installing' || stage === 'actions' ? deadline : null, () => {
    if (stage === 'installing') go(hasActions ? 'actions' : 'screenshot')
    else if (stage === 'actions') go('screenshot')
  })

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

  // ---- Ceremony (steps 1–3) ----
  if (stage === 'copy' || stage === 'store' || stage === 'installing') {
    const step2State: StepState = stage === 'copy' ? 'locked' : stage === 'store' ? 'active' : 'done'
    const step3State: StepState =
      stage === 'installing' ? 'active' : stage === 'copy' || stage === 'store' ? 'locked' : 'done'

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

          <Step
            index={2}
            state={step2State}
            title={t('offer.flow.step2', { store: storeName(offer.platform) })}
          >
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

  // ---- Work stage (rating/review reminders + instruction + screenshot) ----
  return (
    <div className="space-y-4">
      {offer.requires_rating && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex text-amber-400">
              {Array.from({ length: execution?.assigned_rating ?? 0 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </div>
            <span className="text-sm">
              {t('offer.flow.rate', { rating: execution?.assigned_rating ?? '' })}
            </span>
          </CardContent>
        </Card>
      )}

      {offer.requires_review && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 font-semibold text-sm mb-1">
              <MessageSquare className="size-4 text-brand-teal shrink-0" /> {t('offer.flow.reviewTitle')}
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {offer.review_instruction || t('offer.stepReview')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instruction is shown immediately (during the verification wait too). */}
      {(offer.instruction_text || offer.instruction_media_url) && (
        <Card>
          <CardContent className="p-4">
            <div className="font-semibold text-sm mb-2">{t('offer.flow.instruction')}</div>
            {offer.instruction_media_url && (
              <img
                src={offer.instruction_media_url}
                alt=""
                className="w-full rounded-xl mb-2 object-cover max-h-72"
              />
            )}
            {offer.instruction_text && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{offer.instruction_text}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Screenshot upload form appears only after the 60s verification wait. */}
      {stage === 'actions' ? (
        <Card>
          <CardContent className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin shrink-0" /> {t('offer.flow.preparing')}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="text-sm font-semibold">{t('offer.flow.screenshotTitle')}</div>
          {execution ? <OfferWork execution={execution} /> : <Spinner />}
        </>
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

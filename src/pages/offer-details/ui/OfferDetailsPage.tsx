import { ArrowLeft, Check, Copy, ExternalLink, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useGetMyExecutionsQuery } from '@/entities/execution'
import { useGetOfferQuery, useStartOfferMutation } from '@/entities/offer'
import { OfferWork } from '@/features/offer-work'
import { Button, Card, CardContent, CoinAmount, Spinner, StatusBadge } from '@/shared/ui'

export function OfferDetailsPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const { data: offer, isLoading } = useGetOfferQuery(id)
  const { data: mine } = useGetMyExecutionsQuery({ limit: 100 })
  const [start, { isLoading: starting }] = useStartOfferMutation()
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  if (isLoading) return <Spinner />
  if (!offer) return <div className="text-muted-foreground">{t('offer.notFound')}</div>

  const execution = mine?.items.find(
    (e) => e.campaign_id === id && ['in_progress', 'submitted'].includes(e.status),
  )

  const copyKeyword = () => {
    if (!offer.keyword) return
    navigator.clipboard?.writeText(offer.keyword)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const take = async () => {
    setError('')
    try {
      await start({ campaignId: id }).unwrap()
    } catch (e) {
      setError((e as { data?: { detail?: string } })?.data?.detail || t('common.error'))
    }
  }

  return (
    <div>
      <Link to="/app" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-teal">
        <ArrowLeft className="size-4" /> {t('common.back')}
      </Link>

      <Card className="mt-2 mb-4">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
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
          </div>

          {offer.keyword && (
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-1">{t('offer.searchKey')}</div>
              <button
                onClick={copyKeyword}
                className="w-full flex items-center justify-between gap-2 glass-soft rounded-xl px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <span className="font-semibold">{offer.keyword}</span>
                {copied ? <Check className="size-4 text-brand-teal" /> : <Copy className="size-4" />}
              </button>
            </div>
          )}

          <a href={offer.store_url} target="_blank" rel="noreferrer">
            <Button variant="outline" className="w-full mb-4">
              <ExternalLink /> {t('offer.openStore')}
            </Button>
          </a>

          <div className="text-sm space-y-1 text-muted-foreground">
            <div className="font-semibold text-foreground">{t('offer.whatToDo')}</div>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('offer.stepInstall')}</li>
              {offer.requires_open && <li>{t('offer.stepOpen')}</li>}
              {offer.requires_rating && (
                <li>{offer.rating_instruction || t('offer.stepRating')}</li>
              )}
              {offer.requires_review && (
                <li>{offer.review_instruction || t('offer.stepReview')}</li>
              )}
              <li>{t('offer.stepScreenshot')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {execution?.status === 'in_progress' && <OfferWork execution={execution} />}

      {execution?.status === 'submitted' && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-muted-foreground">{t('offer.onReview')}</span>
            <StatusBadge status="submitted" />
          </CardContent>
        </Card>
      )}

      {!execution && (
        <>
          <Button className="w-full" disabled={starting} onClick={take}>
            {t('offer.take')}
          </Button>
          {error && <p className="text-destructive text-sm mt-2 text-center">{error}</p>}
        </>
      )}
    </div>
  )
}

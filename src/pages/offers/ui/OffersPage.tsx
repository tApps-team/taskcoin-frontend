import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronRight, Smartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useGetOffersQuery } from '@/entities/offer'
import { useMeQuery } from '@/entities/session'
import { countryName } from '@/shared/lib/countries'
import { listContainer, listItem } from '@/shared/lib/motion'
import { Button, Card, CardContent, CoinAmount, EmptyState, ListRowSkeleton } from '@/shared/ui'
import { NewsSlider } from '@/widgets/news-slider'

export function OffersPage() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const { data, isLoading } = useGetOffersQuery(undefined, { pollingInterval: 30000 })
  // Already cached by the layout's header — this costs no extra request.
  const { data: me } = useMeQuery()

  return (
    <div>
      <NewsSlider />
      <h1 className="text-3xl font-bold mb-5 tracking-tight">{t('offers.title')}</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <ListRowSkeleton key={i} />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        // Tasks are filtered by country, and the people this hits hardest are on
        // a VPN — so name the country instead of leaving them to guess.
        <EmptyState emoji="📭" text={t('offers.empty')}>
          <p className="text-sm max-w-xs">
            {t('offers.emptyGeoHint', { country: countryName(me?.country) || '—' })}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/app/profile">{t('offers.emptyGeoAction')}</Link>
          </Button>
        </EmptyState>
      ) : (
        <motion.div
          className="space-y-3"
          variants={reduce ? undefined : listContainer}
          initial={reduce ? undefined : 'hidden'}
          animate={reduce ? undefined : 'show'}
        >
          <AnimatePresence mode="popLayout">
            {data.map((o) => (
              <motion.div
                key={o.campaign_id}
                layout={!reduce}
                variants={reduce ? undefined : listItem}
                exit={reduce ? undefined : 'exit'}
              >
                <Link to={`/app/offers/${o.campaign_id}`} state={{ from: '/app' }}>
                  <Card className="hover:border-brand-violet/40 transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      {o.icon_url ? (
                        <img src={o.icon_url} alt="" className="size-12 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                          <Smartphone className="size-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{o.application_name}</div>
                        {o.keyword && <div className="text-xs text-muted-foreground truncate">{o.keyword}</div>}
                      </div>
                      <CoinAmount value={o.price} className="text-brand-teal font-bold" />
                      <ChevronRight className="size-5 text-muted-foreground shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

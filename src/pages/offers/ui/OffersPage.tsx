import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronRight, Smartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useGetOffersQuery } from '@/entities/offer'
import { listContainer, listItem } from '@/shared/lib/motion'
import { Card, CardContent, CoinAmount, EmptyState, ListRowSkeleton } from '@/shared/ui'

export function OffersPage() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const { data, isLoading } = useGetOffersQuery(undefined, { pollingInterval: 30000 })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5 tracking-tight">{t('offers.title')}</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <ListRowSkeleton key={i} />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState emoji="📭" text={t('offers.empty')} />
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
                <Link to={`/app/offers/${o.campaign_id}`}>
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
                        <div className="font-semibold truncate">
                          {o.keyword || o.application_name}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">{o.platform}</div>
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

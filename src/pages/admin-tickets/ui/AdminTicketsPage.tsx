import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAdminGetTicketQuery,
  useAdminGetTicketsQuery,
  useAdminReplyTicketMutation,
} from '@/entities/feedback'
import { ChatComposer, MessageBubble } from '@/features/feedback-chat'
import type { TicketAttachment, TicketType, TipTapDoc } from '@/shared/api/types'
import { formatDate } from '@/shared/lib/format'
import { useFeedbackSocket } from '@/shared/lib/useFeedbackSocket'
import { Card, CardContent, EmptyState, Spinner } from '@/shared/ui'

export function AdminTicketsPage() {
  const [openId, setOpenId] = useState<string | null>(null)
  useFeedbackSocket(true) // admin room: live updates for every ticket

  if (openId) return <AdminThread id={openId} onBack={() => setOpenId(null)} />
  return <AdminList onOpen={setOpenId} />
}

function typeLabel(t: (k: string) => string, type: TicketType): string {
  return t(`feedback.types.${type}`)
}

function AdminList({ onOpen }: { onOpen: (id: string) => void }) {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminGetTicketsQuery(undefined, { pollingInterval: 30000 })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">{t('admin.tickets.title')}</h1>
      {isLoading ? (
        <Spinner />
      ) : !data || data.length === 0 ? (
        <EmptyState emoji="💬" text={t('admin.tickets.empty')} />
      ) : (
        <div className="space-y-3">
          {data.map((tk) => (
            <button key={tk.id} type="button" className="w-full text-left" onClick={() => onOpen(tk.id)}>
              <Card className="hover:border-brand-violet/40 transition-colors">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {typeLabel(t, tk.type)} · {tk.user.full_name || tk.user.email}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {tk.user.email} · {formatDate(tk.last_message_at)}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${tk.status === 'open' ? 'bg-brand-teal/15 text-brand-teal' : 'bg-white/10 text-muted-foreground'}`}
                  >
                    {t(`feedback.status.${tk.status}`)}
                  </span>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function AdminThread({ id, onBack }: { id: string; onBack: () => void }) {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminGetTicketQuery(id)
  const [reply, { isLoading: sending }] = useAdminReplyTicketMutation()

  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages.length])

  const submit = async (body: TipTapDoc, attachments: TicketAttachment[]) => {
    await reply({ ticketId: id, body, attachments }).unwrap()
  }

  return (
    <div className="flex flex-col min-h-[70vh]">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-teal mb-3">
        <ArrowLeft className="size-4" /> {t('common.back')}
      </button>
      {isLoading || !data ? (
        <Spinner />
      ) : (
        <>
          <div className="mb-3">
            <h1 className="text-xl font-bold">{typeLabel(t, data.type)}</h1>
            <div className="text-xs text-muted-foreground">
              {data.user.full_name ? `${data.user.full_name} · ` : ''}
              {data.user.email} · {t(`feedback.status.${data.status}`)}
            </div>
          </div>
          <div className="flex-1 space-y-3 mb-3">
            {data.messages.map((m) => (
              <MessageBubble key={m.id} message={m} mine={m.sender === 'admin'} />
            ))}
            <div ref={bottomRef} />
          </div>
          <ChatComposer onSend={submit} sending={sending} />
        </>
      )}
    </div>
  )
}

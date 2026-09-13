import { ArrowLeft, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAddTicketMessageMutation,
  useCreateTicketMutation,
  useGetTicketQuery,
  useGetTicketsQuery,
} from '@/entities/feedback'
import type { TicketAttachment, TicketMessage, TicketType, TipTapDoc } from '@/shared/api/types'
import { formatDate } from '@/shared/lib/format'
import { useFeedbackSocket } from '@/shared/lib/useFeedbackSocket'
import { Button, Card, CardContent, EmptyState, Spinner } from '@/shared/ui'
import { RichTextContent } from '@/shared/ui/rich-text'
import { ChatComposer } from './ChatComposer'

const TYPES: TicketType[] = ['question', 'cooperation', 'complaint', 'suggestion', 'other']

type View = { mode: 'list' } | { mode: 'new' } | { mode: 'thread'; id: string }

export function FeedbackPage() {
  const { t } = useTranslation()
  const [view, setView] = useState<View>({ mode: 'list' })

  if (view.mode === 'new') return <NewTicket onClose={() => setView({ mode: 'list' })} onCreated={(id) => setView({ mode: 'thread', id })} />
  if (view.mode === 'thread') return <Thread id={view.id} onBack={() => setView({ mode: 'list' })} />
  return <TicketsList onNew={() => setView({ mode: 'new' })} onOpen={(id) => setView({ mode: 'thread', id })} />
}

function typeLabel(t: (k: string) => string, type: TicketType): string {
  return t(`feedback.types.${type}`)
}

function TicketsList({ onNew, onOpen }: { onNew: () => void; onOpen: (id: string) => void }) {
  const { t } = useTranslation()
  const { data, isLoading } = useGetTicketsQuery()

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-bold tracking-tight">{t('feedback.title')}</h1>
        <Button variant="teal" onClick={onNew}>
          <Plus className="size-4" /> {t('feedback.new')}
        </Button>
      </div>
      {isLoading ? (
        <Spinner />
      ) : !data || data.length === 0 ? (
        <EmptyState emoji="💬" text={t('feedback.empty')} />
      ) : (
        <div className="space-y-3">
          {data.map((tk) => (
            <button key={tk.id} type="button" className="w-full text-left" onClick={() => onOpen(tk.id)}>
              <Card className="hover:border-brand-violet/40 transition-colors">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{typeLabel(t, tk.type)}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(tk.last_message_at)}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${tk.status === 'open' ? 'bg-brand-teal/15 text-brand-teal' : 'bg-white/10 text-muted-foreground'}`}>
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

function NewTicket({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const { t } = useTranslation()
  const [type, setType] = useState<TicketType>('question')
  const [create, { isLoading }] = useCreateTicketMutation()

  const submit = async (body: TipTapDoc, attachments: TicketAttachment[]) => {
    const ticket = await create({ type, body, attachments }).unwrap()
    onCreated(ticket.id)
  }

  return (
    <div>
      <button type="button" onClick={onClose} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-teal mb-3">
        <ArrowLeft className="size-4" /> {t('common.back')}
      </button>
      <h1 className="text-2xl font-bold mb-4">{t('feedback.new')}</h1>

      <div className="mb-3">
        <div className="text-sm text-muted-foreground mb-2">{t('feedback.chooseType')}</div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((tp) => (
            <button
              key={tp}
              type="button"
              onClick={() => setType(tp)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${type === tp ? 'bg-brand-violet text-white' : 'bg-white/10 text-muted-foreground hover:bg-white/15'}`}
            >
              {typeLabel(t, tp)}
            </button>
          ))}
        </div>
      </div>

      <ChatComposer onSend={submit} sending={isLoading} />
    </div>
  )
}

function Thread({ id, onBack }: { id: string; onBack: () => void }) {
  const { t } = useTranslation()
  const { data, isLoading } = useGetTicketQuery(id)
  const [addMessage, { isLoading: sending }] = useAddTicketMessageMutation()
  useFeedbackSocket(true)

  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages.length])

  const submit = async (body: TipTapDoc, attachments: TicketAttachment[]) => {
    await addMessage({ ticketId: id, body, attachments }).unwrap()
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
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">{typeLabel(t, data.type)}</h1>
            <span className="text-xs text-muted-foreground">{t(`feedback.status.${data.status}`)}</span>
          </div>
          <div className="flex-1 space-y-3 mb-3">
            {data.messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            <div ref={bottomRef} />
          </div>
          <ChatComposer onSend={submit} sending={sending} />
        </>
      )}
    </div>
  )
}

function MessageBubble({ message }: { message: TicketMessage }) {
  const { t } = useTranslation()
  const isAdmin = message.sender === 'admin'
  const images = message.attachments.filter((a) => a.kind === 'image')
  const files = message.attachments.filter((a) => a.kind === 'file')
  const hasBody = !!(message.body as { content?: unknown[] })?.content?.length

  return (
    <div className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${isAdmin ? 'bg-white/8' : 'bg-brand-violet/20'}`}>
        <div className="text-[11px] text-muted-foreground mb-1">
          {isAdmin ? message.admin_name || t('feedback.support') : t('feedback.you')} · {formatDate(message.created_at)}
        </div>
        {hasBody && <RichTextContent content={message.body} className="text-sm" />}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((a, i) => (
              <a key={i} href={a.url} target="_blank" rel="noreferrer">
                <img src={a.url} alt="" className="w-28 h-28 object-cover rounded-lg border border-white/10" />
              </a>
            ))}
          </div>
        )}
        {files.map((a, i) => (
          <a key={i} href={a.url} target="_blank" rel="noreferrer" className="block text-sm text-brand-teal mt-1 underline">
            📎 {a.name}
          </a>
        ))}
      </div>
    </div>
  )
}

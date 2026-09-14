import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/app/providers/store'
import { feedbackApi } from '@/entities/feedback'
import type { TicketMessage } from '@/shared/api/types'
import { getAccess } from '@/shared/lib/tokens'

// Opens a WebSocket to /api/feedback/ws and patches the RTK cache when an admin
// reply arrives, so the open thread updates in real time. Reconnects on drop.
export function useFeedbackSocket(active: boolean) {
  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    if (!active) return
    const token = getAccess()
    if (!token) return

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const url = `${proto}://${window.location.host}/api/feedback/ws?token=${encodeURIComponent(token)}`
    let ws: WebSocket | null = null
    let closed = false
    let retry: ReturnType<typeof setTimeout>

    const connect = () => {
      ws = new WebSocket(url)
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as {
            type: string
            ticket_id: string
            message: TicketMessage
          }
          if (data.type !== 'ticket_message' || !data.ticket_id) return
          // Patch both the user-side and the CRM caches (whichever is mounted).
          const push = (draft: { messages: TicketMessage[] }) => {
            if (!draft.messages.some((m) => m.id === data.message.id)) draft.messages.push(data.message)
          }
          dispatch(feedbackApi.util.updateQueryData('getTicket', data.ticket_id, push))
          dispatch(feedbackApi.util.updateQueryData('adminGetTicket', data.ticket_id, push))
          dispatch(
            feedbackApi.util.invalidateTags([
              'FeedbackTickets',
              'AdminTickets',
              'UserUnread',
              'AdminBadges',
            ]),
          )
        } catch {
          /* ignore malformed frames */
        }
      }
      ws.onclose = () => {
        if (!closed) retry = setTimeout(connect, 3000)
      }
      ws.onerror = () => ws?.close()
    }
    connect()

    return () => {
      closed = true
      clearTimeout(retry)
      ws?.close()
    }
  }, [active, dispatch])
}

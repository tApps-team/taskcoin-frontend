import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/app/providers/store'
import { feedbackApi } from '@/entities/feedback'
import type { TicketMessage } from '@/shared/api/types'
import { getAccess } from '@/shared/lib/tokens'

// Live updates for tickets + badges. Mounted once per layout (user / admin), so
// the socket stays open across navigation and every screen revalidates.
//
// Important details learned the hard way:
//  - the access token is short-lived, so it is read FRESH on every connect
//    attempt (baking it into a closure made reconnects fail forever once the
//    token expired — updates then only appeared after a page reload);
//  - browsers (especially mobile) drop sockets in the background, so we
//    re-check the connection when the tab becomes visible or the network
//    returns.
export function useFeedbackSocket(active: boolean) {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (!active) return

    let ws: WebSocket | null = null
    let closed = false
    let retry: ReturnType<typeof setTimeout>

    const connect = () => {
      if (closed) return
      const token = getAccess()
      if (!token) {
        retry = setTimeout(connect, 3000) // wait until (re)authenticated
        return
      }
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
      ws = new WebSocket(
        `${proto}://${window.location.host}/api/feedback/ws?token=${encodeURIComponent(token)}`,
      )

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as {
            type: string
            ticket_id: string
            message: TicketMessage
          }
          // Moderation queue changed (submit / approve / reject) → refresh badge.
          if (data.type === 'executions_changed') {
            dispatch(feedbackApi.util.invalidateTags(['AdminBadges', 'AdminExecutions']))
            return
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
              'FeedbackTicket',
              'AdminTicket',
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

    // Reconnect if the socket died while the tab was hidden / offline.
    const ensure = () => {
      if (closed) return
      if (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
        clearTimeout(retry)
        connect()
      }
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') ensure()
    }

    connect()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', ensure)

    return () => {
      closed = true
      clearTimeout(retry)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', ensure)
      ws?.close()
    }
  }, [active, dispatch])
}

import { baseApi } from '@/shared/api'
import type {
  AdminTicket,
  AdminTicketListItem,
  Ticket,
  TicketAttachment,
  TicketListItem,
  TicketMessage,
  TicketType,
  TipTapDoc,
} from '@/shared/api/types'

interface CreateTicketArg {
  type: TicketType
  body: TipTapDoc
  attachments: TicketAttachment[]
}

interface AddMessageArg {
  ticketId: string
  body: TipTapDoc
  attachments: TicketAttachment[]
}

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getTickets: b.query<TicketListItem[], void>({
      query: () => '/feedback/tickets',
      providesTags: ['FeedbackTickets'],
    }),
    getTicket: b.query<Ticket, string>({
      query: (id) => `/feedback/tickets/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'FeedbackTicket', id }],
    }),
    createTicket: b.mutation<Ticket, CreateTicketArg>({
      query: (body) => ({ url: '/feedback/tickets', method: 'POST', body }),
      invalidatesTags: ['FeedbackTickets'],
    }),
    addTicketMessage: b.mutation<TicketMessage, AddMessageArg>({
      query: ({ ticketId, body, attachments }) => ({
        url: `/feedback/tickets/${ticketId}/messages`,
        method: 'POST',
        body: { body, attachments },
      }),
      // Append to the open thread instantly; also refresh the list order.
      async onQueryStarted({ ticketId }, { dispatch, queryFulfilled }) {
        try {
          const { data: msg } = await queryFulfilled
          dispatch(
            feedbackApi.util.updateQueryData('getTicket', ticketId, (draft) => {
              if (!draft.messages.some((m) => m.id === msg.id)) draft.messages.push(msg)
            }),
          )
          dispatch(feedbackApi.util.invalidateTags(['FeedbackTickets']))
        } catch {
          /* ignore */
        }
      },
    }),
    uploadFeedbackMedia: b.mutation<TicketAttachment, FormData>({
      query: (body) => ({ url: '/feedback/upload', method: 'POST', body }),
    }),

    // --- Admin (CRM) ---
    adminGetTickets: b.query<AdminTicketListItem[], void>({
      query: () => '/admin/tickets',
      providesTags: ['AdminTickets'],
    }),
    adminGetTicket: b.query<AdminTicket, string>({
      query: (id) => `/admin/tickets/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'AdminTicket', id }],
    }),
    adminReplyTicket: b.mutation<TicketMessage, AddMessageArg>({
      query: ({ ticketId, body, attachments }) => ({
        url: `/admin/tickets/${ticketId}/messages`,
        method: 'POST',
        body: { body, attachments },
      }),
      async onQueryStarted({ ticketId }, { dispatch, queryFulfilled }) {
        try {
          const { data: msg } = await queryFulfilled
          dispatch(
            feedbackApi.util.updateQueryData('adminGetTicket', ticketId, (draft) => {
              if (!draft.messages.some((m) => m.id === msg.id)) draft.messages.push(msg)
            }),
          )
          dispatch(feedbackApi.util.invalidateTags(['AdminTickets']))
        } catch {
          /* ignore */
        }
      },
    }),
  }),
})

export const {
  useGetTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useAddTicketMessageMutation,
  useUploadFeedbackMediaMutation,
  useAdminGetTicketsQuery,
  useAdminGetTicketQuery,
  useAdminReplyTicketMutation,
} = feedbackApi

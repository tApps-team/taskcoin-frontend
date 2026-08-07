import { baseApi } from '@/shared/api'
import type { AdminExecution, Execution, Paginated } from '@/shared/api/types'

// Cache key the offer flow / active page read /executions/my with. We patch it
// in place after an upload/delete so the new screenshot shows instantly instead
// of waiting for a full refetch of the list.
const MY_EXEC_ARGS = { limit: 100 }

function patchMyExecution(
  dispatch: (action: unknown) => void,
  executionId: string,
  updated: Execution,
) {
  dispatch(
    executionApi.util.updateQueryData('getMyExecutions', MY_EXEC_ARGS, (draft) => {
      const idx = draft.items.findIndex((e) => e.id === executionId)
      if (idx !== -1) draft.items[idx] = updated
    }),
  )
}

export const executionApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getMyExecutions: b.query<
      Paginated<Execution>,
      { status?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({ url: '/executions/my', params: params || undefined }),
      providesTags: ['Executions'],
    }),
    // Upload/delete return the updated execution — patch the cached list from
    // the response instead of invalidating (which would force a slow full
    // refetch of /executions/my before the next step can appear).
    uploadScreenshots: b.mutation<Execution, { executionId: string; files: FormData }>({
      query: ({ executionId, files }) => ({
        url: `/executions/${executionId}/screenshots`,
        method: 'POST',
        body: files,
      }),
      async onQueryStarted({ executionId }, { dispatch, queryFulfilled }) {
        try {
          const { data: updated } = await queryFulfilled
          patchMyExecution(dispatch, executionId, updated)
        } catch {
          /* upload failed — nothing to patch */
        }
      },
    }),
    deleteScreenshot: b.mutation<Execution, { executionId: string; screenshotId: string }>({
      query: ({ executionId, screenshotId }) => ({
        url: `/executions/${executionId}/screenshots/${screenshotId}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ executionId }, { dispatch, queryFulfilled }) {
        try {
          const { data: updated } = await queryFulfilled
          patchMyExecution(dispatch, executionId, updated)
        } catch {
          /* delete failed — nothing to patch */
        }
      },
    }),
    submitExecution: b.mutation<Execution, string>({
      query: (id) => ({ url: `/executions/${id}/submit`, method: 'POST' }),
      invalidatesTags: ['Executions'],
    }),

    // admin
    adminGetExecutions: b.query<
      Paginated<AdminExecution>,
      { status?: string; search?: string; sort?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({ url: '/admin/executions', params: params || undefined }),
      providesTags: ['AdminExecutions'],
    }),
    adminGetCampaignExecutions: b.query<
      Paginated<AdminExecution>,
      { campaignId: string; status?: string }
    >({
      query: ({ campaignId, status }) => ({
        url: `/admin/campaigns/${campaignId}/executions`,
        params: status ? { status } : undefined,
      }),
      providesTags: ['AdminExecutions'],
    }),
    adminApprove: b.mutation<AdminExecution, string>({
      query: (id) => ({ url: `/admin/executions/${id}/approve`, method: 'POST' }),
      invalidatesTags: ['AdminExecutions', 'Dashboard', 'Campaigns'],
    }),
    adminReject: b.mutation<AdminExecution, { id: string; comment: string }>({
      query: ({ id, comment }) => ({
        url: `/admin/executions/${id}/reject`,
        method: 'POST',
        body: { comment },
      }),
      invalidatesTags: ['AdminExecutions', 'Dashboard'],
    }),
  }),
})

export const {
  useGetMyExecutionsQuery,
  useUploadScreenshotsMutation,
  useDeleteScreenshotMutation,
  useSubmitExecutionMutation,
  useAdminGetExecutionsQuery,
  useAdminGetCampaignExecutionsQuery,
  useAdminApproveMutation,
  useAdminRejectMutation,
} = executionApi

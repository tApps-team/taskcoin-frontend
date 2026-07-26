import { baseApi } from '@/shared/api'
import type { AdminExecution, Execution, Paginated } from '@/shared/api/types'

export const executionApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getMyExecutions: b.query<
      Paginated<Execution>,
      { status?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({ url: '/executions/my', params: params || undefined }),
      providesTags: ['Executions'],
    }),
    uploadScreenshots: b.mutation<Execution, { executionId: string; files: FormData }>({
      query: ({ executionId, files }) => ({
        url: `/executions/${executionId}/screenshots`,
        method: 'POST',
        body: files,
      }),
      invalidatesTags: ['Executions'],
    }),
    deleteScreenshot: b.mutation<Execution, { executionId: string; screenshotId: string }>({
      query: ({ executionId, screenshotId }) => ({
        url: `/executions/${executionId}/screenshots/${screenshotId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Executions'],
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

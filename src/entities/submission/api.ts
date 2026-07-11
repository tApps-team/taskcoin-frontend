import { baseApi } from '@/shared/api'
import type { AdminSubmission, Paginated, Submission } from '@/shared/api/types'

export const submissionApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    startTask: b.mutation<Submission, string>({
      query: (id) => ({ url: `/tasks/${id}/start`, method: 'POST' }),
      invalidatesTags: ['Submissions', 'Tasks'],
    }),
    getMySubmissions: b.query<
      Paginated<Submission>,
      { status?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({ url: '/submissions/my', params: params || undefined }),
      providesTags: ['Submissions'],
    }),
    uploadScreenshots: b.mutation<Submission, { submissionId: string; files: FormData }>({
      query: ({ submissionId, files }) => ({
        url: `/submissions/${submissionId}/screenshots`,
        method: 'POST',
        body: files,
      }),
      invalidatesTags: ['Submissions'],
    }),
    deleteScreenshot: b.mutation<Submission, { submissionId: string; screenshotId: string }>({
      query: ({ submissionId, screenshotId }) => ({
        url: `/submissions/${submissionId}/screenshots/${screenshotId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Submissions'],
    }),
    submitSubmission: b.mutation<Submission, string>({
      query: (id) => ({ url: `/submissions/${id}/submit`, method: 'POST' }),
      invalidatesTags: ['Submissions'],
    }),

    // admin
    adminGetSubmissions: b.query<
      Paginated<AdminSubmission>,
      { status?: string; search?: string; sort?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({ url: '/admin/submissions', params: params || undefined }),
      providesTags: ['AdminSubmissions'],
    }),
    adminApprove: b.mutation<AdminSubmission, string>({
      query: (id) => ({ url: `/admin/submissions/${id}/approve`, method: 'POST' }),
      invalidatesTags: ['AdminSubmissions', 'Dashboard', 'AdminTasks'],
    }),
    adminReject: b.mutation<AdminSubmission, { id: string; comment: string }>({
      query: ({ id, comment }) => ({
        url: `/admin/submissions/${id}/reject`,
        method: 'POST',
        body: { comment },
      }),
      invalidatesTags: ['AdminSubmissions', 'Dashboard'],
    }),
  }),
})

export const {
  useStartTaskMutation,
  useGetMySubmissionsQuery,
  useUploadScreenshotsMutation,
  useDeleteScreenshotMutation,
  useSubmitSubmissionMutation,
  useAdminGetSubmissionsQuery,
  useAdminApproveMutation,
  useAdminRejectMutation,
} = submissionApi

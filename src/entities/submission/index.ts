export type { Submission, AdminSubmission, SubmissionStatus, Screenshot } from '@/shared/api/types'
export {
  submissionApi,
  useStartTaskMutation,
  useGetMySubmissionsQuery,
  useUploadScreenshotsMutation,
  useDeleteScreenshotMutation,
  useSubmitSubmissionMutation,
  useAdminGetSubmissionsQuery,
  useAdminApproveMutation,
  useAdminRejectMutation,
} from './api'

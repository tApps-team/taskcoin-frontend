export type { TaskCard as TaskCardType, TaskDetail, TaskStatus, TipTapDoc, Category } from '@/shared/api/types'
export {
  taskApi,
  useGetTasksQuery,
  useGetTaskQuery,
  useAdminGetTasksQuery,
  useAdminGetTaskQuery,
  useAdminCreateTaskMutation,
  useAdminUpdateTaskMutation,
  useAdminSetTaskStatusMutation,
  useAdminDeleteTaskMutation,
  useAdminGetTaskSubmissionsQuery,
} from './api'
export { TaskCard } from './ui/TaskCard'
export { TaskContent } from './ui/TaskContent'
export { tiptapExtensions } from './ui/tiptap/extensions'

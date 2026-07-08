import { baseApi } from '@/shared/api'
import type { Paginated, TaskCard, TaskDetail, AdminSubmission } from '@/shared/api/types'

export const taskApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getTasks: b.query<
      Paginated<TaskCard>,
      { category?: string; sort?: string; search?: string; limit?: number; offset?: number }
    >({
      query: (params) => ({ url: '/tasks', params }),
      providesTags: ['Tasks'],
    }),
    getTask: b.query<TaskDetail, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Task', id }],
    }),

    // admin
    adminGetTasks: b.query<
      Paginated<TaskDetail>,
      { status?: string; category?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({ url: '/admin/tasks', params: params || undefined }),
      providesTags: ['AdminTasks'],
    }),
    adminGetTask: b.query<TaskDetail, string>({
      query: (id) => `/admin/tasks/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'AdminTasks', id }],
    }),
    adminCreateTask: b.mutation<TaskDetail, Record<string, unknown>>({
      query: (body) => ({ url: '/admin/tasks', method: 'POST', body }),
      invalidatesTags: ['AdminTasks', 'Tasks', 'Dashboard'],
    }),
    adminUpdateTask: b.mutation<TaskDetail, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/admin/tasks/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminTasks', 'Tasks'],
    }),
    adminSetTaskStatus: b.mutation<TaskDetail, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/tasks/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['AdminTasks', 'Tasks', 'Dashboard'],
    }),
    adminDeleteTask: b.mutation<void, string>({
      query: (id) => ({ url: `/admin/tasks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminTasks', 'Tasks'],
    }),
    adminGetTaskSubmissions: b.query<
      Paginated<AdminSubmission>,
      { taskId: string; status?: string }
    >({
      query: ({ taskId, status }) => ({
        url: `/admin/tasks/${taskId}/submissions`,
        params: status ? { status } : undefined,
      }),
      providesTags: ['AdminSubmissions'],
    }),
  }),
})

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useAdminGetTasksQuery,
  useAdminGetTaskQuery,
  useAdminCreateTaskMutation,
  useAdminUpdateTaskMutation,
  useAdminSetTaskStatusMutation,
  useAdminDeleteTaskMutation,
  useAdminGetTaskSubmissionsQuery,
} = taskApi

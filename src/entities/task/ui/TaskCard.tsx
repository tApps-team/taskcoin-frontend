import { Link } from 'react-router-dom'
import type { TaskCard as TaskCardType } from '@/shared/api/types'
import { Badge, CoinAmount, StatusBadge } from '@/shared/ui'

// Light-glass card for the tasks grid (cheaper blur — avoids list jank).
export function TaskCard({ task }: { task: TaskCardType }) {
  return (
    <Link to={`/app/tasks/${task.id}`} className="group">
      <div className="glass-soft glass-hover rounded-2xl p-4 flex flex-col gap-2 h-full">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            {task.category.icon} {task.category.title}
          </Badge>
          <StatusBadge status={task.status} />
        </div>
        <h3 className="font-semibold leading-snug group-hover:text-white transition-colors">
          {task.title}
        </h3>
        <CoinAmount value={task.reward} className="mt-auto text-brand-teal font-bold text-lg" />
      </div>
    </Link>
  )
}

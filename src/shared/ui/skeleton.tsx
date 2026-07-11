import { cn } from '@/shared/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-white/10', className)}
      {...props}
    />
  )
}

// Placeholder matching a TaskCard in the tasks grid.
export function TaskCardSkeleton() {
  return (
    <div className="glass-soft rounded-2xl p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="mt-auto h-6 w-20" />
    </div>
  )
}

// Placeholder matching a list row (history / active).
export function ListRowSkeleton() {
  return (
    <div className="glass-soft rounded-2xl p-4 flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  )
}

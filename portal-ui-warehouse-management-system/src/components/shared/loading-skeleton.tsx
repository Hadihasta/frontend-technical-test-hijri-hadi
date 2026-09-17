import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  rows?: number
  className?: string
}

export function LoadingSkeleton({ rows = 4, className }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-2 p-4', className)} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton-shimmer h-[34px] rounded-md" />
      ))}
    </div>
  )
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[10px] border border-border bg-white p-3.5"
        >
          <div className="skeleton-shimmer h-3 w-24 rounded" />
          <div className="skeleton-shimmer mt-3 h-7 w-16 rounded" />
          <div className="skeleton-shimmer mt-2 h-2.5 w-28 rounded" />
        </div>
      ))}
    </div>
  )
}

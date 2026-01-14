interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`skeleton rounded ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl bg-card p-6 shadow-sm">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl bg-card overflow-hidden">
      <div className="border-b border-border p-4">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

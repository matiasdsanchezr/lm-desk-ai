export function ChatHistorySidebarSkeleton() {
  return (
    <aside className="hidden h-full w-65 shrink-0 flex-col border-r border-border/40 bg-sidebar/50 md:flex">
      {/* Header Skeleton */}
      <div className="border-b border-border/40 p-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-16 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col space-y-2 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-full animate-pulse rounded-md border border-border/30 bg-muted/40"
          />
        ))}
      </div>
    </aside>
  )
}

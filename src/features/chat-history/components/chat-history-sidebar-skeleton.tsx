import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar"

export function ChatHistorySidebarSkeleton() {
  return (
    <Sidebar
      collapsible="icon"
      className="h-full w-full border-r border-zinc-200/50 bg-zinc-50/50 md:w-80 dark:border-zinc-800/50 dark:bg-zinc-950/20"
    >
      <SidebarHeader className="border-b border-zinc-200/50 p-3 dark:border-zinc-800/50">
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-16 animate-pulse rounded-lg bg-muted" />
        </div>
      </SidebarHeader>
      <SidebarContent className="space-y-2 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-full animate-pulse rounded-md border border-border/30 bg-muted/40"
          />
        ))}
      </SidebarContent>
    </Sidebar>
  )
}

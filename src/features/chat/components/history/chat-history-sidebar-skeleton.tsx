import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/shared/components/ui/sidebar"

export function ChatHistorySidebarSkeleton() {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/40 bg-sidebar/50 backdrop-blur-xs transition-all duration-300"
    >
      <SidebarHeader className="border-b border-border/40 p-2 group-data-[collapsible=icon]:border-b-0 group-data-[collapsible=icon]:p-2 md:px-3.5 md:py-3">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-2">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <div className="size-4 shrink-0 animate-pulse rounded bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </div>

          <div className="flex items-center gap-1.5 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
            <div className="size-8 animate-pulse rounded-lg bg-muted group-data-[collapsible=icon]:size-8 md:h-8 md:w-16" />
            <div className="size-8 animate-pulse rounded-md bg-muted/60" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 group-data-[collapsible=icon]:hidden">
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex h-14 w-full animate-pulse flex-col justify-center space-y-2 rounded-md border border-border/30 bg-muted/30 p-2.5"
              >
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted/70" />
              </div>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

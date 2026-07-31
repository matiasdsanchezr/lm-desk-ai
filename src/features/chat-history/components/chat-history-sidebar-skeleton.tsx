import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar"

export function ChatHistorySidebarSkeleton() {
  return (
    <Sidebar
      collapsible="icon"
      className="h-full w-full border-r border-border/40 bg-sidebar/50"
    >
      <SidebarHeader className="border-b border-border/40 p-2 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:border-b-0 md:p-3">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
          <div className="h-5 w-24 animate-pulse rounded-md bg-muted group-data-[collapsible=icon]:hidden" />
          <div className="h-8 w-16 animate-pulse rounded-lg bg-muted group-data-[collapsible=icon]:w-8" />
        </div>
      </SidebarHeader>
      <SidebarContent className="space-y-2 p-2 group-data-[collapsible=icon]:hidden">
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

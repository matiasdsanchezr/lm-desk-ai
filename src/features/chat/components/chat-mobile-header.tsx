import { SidebarTrigger } from "@/shared/components/ui/sidebar"

export const ChatMobileHeader = ({ title }: { title: string }) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card/60 px-3 py-2 shadow-xs backdrop-blur-xs md:hidden">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground" />
        <span className="truncate text-xs font-semibold tracking-tight text-foreground">
          {title}
        </span>
      </div>
    </div>
  )
}

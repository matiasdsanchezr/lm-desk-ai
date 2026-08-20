import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar"
import type { ChatMeta } from "../../types"
import { ChatHistoryList } from "./chat-history-list"
import { NewChatButton } from "./new-chat-button"

interface ChatHistorySidebarProps {
  savedChatsPromise: Promise<ChatMeta[]>
}

export function ChatHistorySidebar({
  savedChatsPromise,
}: ChatHistorySidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/40 bg-sidebar/50 backdrop-blur-xs transition-all duration-300"
    >
      <SidebarHeader className="border-b border-border/40 p-2 group-data-[collapsible=icon]:border-b-0 group-data-[collapsible=icon]:p-2 md:px-3.5 md:py-3">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
            <span className="icon-[lucide--history] size-4 shrink-0 text-primary" />
            <span>Historial</span>
          </div>

          <div className="flex items-center gap-1.5 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
            <NewChatButton />
            <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-foreground" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 group-data-[collapsible=icon]:hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            <ChatHistoryList savedChatsPromise={savedChatsPromise} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

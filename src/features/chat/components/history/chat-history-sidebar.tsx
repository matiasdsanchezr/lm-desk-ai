import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
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
      collapsible="offcanvas"
      className="border-r border-border/40 bg-sidebar/50 backdrop-blur-xs transition-all duration-300"
    >
      <SidebarHeader className="border-b border-border/40 p-2 sm:px-3.5 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
            <span className="icon-[lucide--history] size-4 shrink-0 text-primary" />
            <span>Historial</span>
          </div>

          <NewChatButton />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <ChatHistoryList savedChatsPromise={savedChatsPromise} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

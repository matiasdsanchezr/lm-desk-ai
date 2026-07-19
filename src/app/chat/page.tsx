import { SidebarProvider } from "@/components/ui/sidebar"
import { ChatShell as ChatShellContent } from "@/features/chat"
import {
  ChatHistorySidebar,
  listResponses,
  loadResponse,
} from "@/features/chat-history"
import { generateTreeStructure } from "@/features/file-explorer/actions/get-file-tree"
import { SettingsDrawer } from "@/features/settings"
import { Suspense } from "react"

type SearchParams = Promise<{ responseId?: string }>

const ChatShell = async ({ responseId }: { responseId?: string }) => {
  const [treeStructure, responses, initialResponse] = await Promise.all([
    generateTreeStructure(),
    listResponses(),
    responseId
      ? loadResponse(responseId).catch(() => null)
      : Promise.resolve(null),
  ])

  return (
    <div className="flex h-full w-full items-stretch overflow-hidden">
      <ChatHistorySidebar responses={responses} />
      <div className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
        <ChatShellContent
          key={responseId ?? "new-chat"}
          totalFiles={treeStructure.totalFiles}
          treeNodes={treeStructure.treeNodes}
          initialResponse={initialResponse}
        />
      </div>
    </div>
  )
}

export default async function Chat({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { responseId } = await searchParams

  return (
    <main className="relative flex h-dvh w-full flex-col overflow-hidden bg-background font-sans selection:bg-primary/10">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[14px_24px]" />
      <Suspense fallback={<></>}>
        <SettingsDrawer />
      </Suspense>
      <section className="min-h-0 w-full flex-1">
        <SidebarProvider className="h-full items-stretch">
          <Suspense
            fallback={
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-muted-foreground">
                <span className="icon-[fa6-solid--spinner] animate-spin text-4xl" />
                <p className="animate-pulse">
                  Preparando entorno de análisis...
                </p>
              </div>
            }
          >
            <ChatShell responseId={responseId} />
          </Suspense>
        </SidebarProvider>
      </section>
    </main>
  )
}

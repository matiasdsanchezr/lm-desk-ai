"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { useChatStore } from "@/entities/chat/model/chat-store"
import { SavedChat } from "@/entities/chat/model/types"
import {
  formatFilesContent,
  PromptBuilder,
} from "@/features/chat/lib/prompt-utils"
import {
  getFileContents,
  getTreeStructure,
  useFileExplorerStore,
} from "@/features/file-explorer"
import { useSettingsStore } from "@/features/inference-settings"
import { ActionState } from "@/shared/types/action-state"
import { useChat } from "@ai-sdk/react"
import { type FileUIPart } from "ai"
import { notFound, useRouter } from "next/navigation"
import { use, useActionState } from "react"
import { useShallow } from "zustand/shallow"
import { ChatThread } from "./chat-thread"
import { ContextBuilder } from "./context-builder"
import { GeneratedPrompt } from "./generated-prompt"
import { PromptReviewer } from "./prompt-reviewer"

interface ChatWorkspaceProps {
  treeStructurePromise: ReturnType<typeof getTreeStructure>
  initialChatPromise?: Promise<ActionState<SavedChat>>
}

export function ChatWorkspace({
  treeStructurePromise,
  initialChatPromise,
}: ChatWorkspaceProps) {
  const treeStructure = use(treeStructurePromise)
  const initialChatResult = initialChatPromise ? use(initialChatPromise) : null

  if (!treeStructure.data) {
    notFound()
  }

  if (initialChatResult && !initialChatResult.data) {
    notFound()
  }

  const router = useRouter()
  const { totalFiles, treeNodes } = treeStructure.data
  const initialChat = initialChatResult?.data ?? null

  const { sessionId, includeReasoning, contextualPrompt, standalonePrompt } =
    useChatStore(
      useShallow((s) => ({
        sessionId: s.sessionId,
        includeReasoning: s.includeReasoning,
        contextualPrompt: s.contextualPrompt,
        standalonePrompt: s.standalonePrompt,
      }))
    )

  const { selectedFiles, images } = useFileExplorerStore(
    useShallow((s) => ({
      selectedFiles: s.selectedFiles,
      images: s.images,
    }))
  )

  const settings = useSettingsStore(
    useShallow((s) => ({
      modelConfig: s.modelConfig,
      systemPrompt: s.systemPrompt,
      temperature: s.temperature,
      topP: s.topP,
    }))
  )

  const [fetchFileState, handleFetchFileContents, isFetchingFiles] =
    useActionState(
      async (_: unknown, formData: FormData) => {
        const { data, error } = await getFileContents({}, formData)
        if (error || !data) {
          return {
            error: error ?? "Se produjo un error al analizar los archivos",
          }
        }
        if (data.fileContents) {
          const userTask = useChatStore.getState().userTask
          const setPrompts = useChatStore.getState().actions.setPrompts
          const { setFileContents, setImages } = useFileExplorerStore.getState()

          const promptBuilder = new PromptBuilder()
            .addSystem(settings.systemPrompt)
            .addContext(formatFilesContent(data.fileContents))
            .addTask(userTask)

          setFileContents(data.fileContents)
          setImages(data.imageFiles)
          setPrompts({
            contextualPrompt: promptBuilder.buildContextAndTask(),
            standalonePrompt: promptBuilder.build(),
          })

          return { error: null }
        }
      },
      { error: null }
    )

  const {
    messages,
    status,
    error,
    setMessages,
    sendMessage,
    clearError,
    stop,
  } = useChat({
    id: sessionId,
    messages: initialChat?.messages,
    onFinish: () => {
      router.refresh()
    },
  })

  const isReadyToReview = Boolean(standalonePrompt)
  const isStreaming = status === "streaming" || status === "submitted"
  const isDisabled = isFetchingFiles || isStreaming || isReadyToReview

  const generateContentHandler = () => {
    clearError()
    setMessages([])

    const imageFiles: FileUIPart[] = images.map((i) => ({
      type: "file",
      mediaType: i.mimeType,
      url: `data:${i.mimeType};base64,${i.base64}`,
    }))

    sendMessage(
      { text: contextualPrompt, files: imageFiles },
      {
        body: {
          system: settings.systemPrompt,
          provider: settings.modelConfig.provider,
          model: settings.modelConfig.model,
          temperature: settings.temperature,
          topP: settings.topP,
          selectedFiles,
        },
      }
    )
  }

  const handleSendFollowUp = (text: string) => {
    if (!text.trim() || isStreaming) return

    sendMessage(
      { text },
      {
        body: {
          system: settings.systemPrompt,
          provider: settings.modelConfig.provider,
          model: settings.modelConfig.model,
          temperature: settings.temperature,
          topP: settings.topP,
          selectedFiles,
          includeReasoning,
        },
      }
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-350 flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card/60 px-3 py-2 shadow-xs backdrop-blur-xs md:hidden">
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground" />
          <span className="truncate text-xs font-semibold tracking-tight text-foreground">
            {initialChat?.title || "Nueva Sesión"}
          </span>
        </div>
      </div>

      <ContextBuilder
        treeNodes={treeNodes}
        totalFiles={totalFiles}
        isDisabled={isDisabled}
        isFetchingFiles={isFetchingFiles}
        isReadyToReview={isReadyToReview}
        fetchFileState={fetchFileState}
        handleFetchFileContents={handleFetchFileContents}
      />

      {isReadyToReview && (
        <PromptReviewer
          disabled={messages.length > 0}
          isStreaming={isStreaming}
          onGenerateContent={generateContentHandler}
          stop={stop}
        >
          <GeneratedPrompt />
        </PromptReviewer>
      )}

      {(messages.length > 0 || error) && (
        <div className="space-y-4">
          <ChatThread
            messages={messages}
            error={error}
            isStreaming={isStreaming}
            onSendFollowUp={handleSendFollowUp}
            setMessages={setMessages}
          />
        </div>
      )}
    </div>
  )
}

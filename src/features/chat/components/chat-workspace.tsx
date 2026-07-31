"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { SavedChat } from "@/features/chat-history/types/saved-chat"
import { useChatActions, useChatStore } from "@/features/chat/store/chat-store"
import { getFileContents } from "@/features/file-explorer/actions/get-file-contents"
import { generateTreeStructure } from "@/features/file-explorer/actions/get-file-tree"
import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import { useSettingsStore } from "@/features/settings/store/settings-store"
import { ActionState } from "@/types/action-state"
import { PromptBuilder } from "@/utils/prompt-builder"
import { useChat } from "@ai-sdk/react"
import { type FileUIPart } from "ai"
import { notFound, useRouter } from "next/navigation"
import { use, useActionState, useMemo, useState } from "react"
import { useShallow } from "zustand/shallow"
import { ChatThread } from "./chat-thread"
import { ContextBuilder } from "./context-builder"
import { GeneratedPrompt } from "./generated-prompt"
import { PromptReviewer } from "./prompt-reviewer"

interface ChatWorkspaceProps {
  treeStructurePromise: ReturnType<typeof generateTreeStructure>
  initialChatPromise?: Promise<ActionState<SavedChat>>
}

export function ChatWorkspace({
  treeStructurePromise,
  initialChatPromise,
}: ChatWorkspaceProps) {
  const router = useRouter()
  const treeStructure = use(treeStructurePromise)
  const initialChatResult = initialChatPromise ? use(initialChatPromise) : null

  if (
    initialChatResult &&
    (initialChatResult.error || !initialChatResult.data)
  ) {
    notFound()
  }

  if (!treeStructure.data) {
    notFound()
  }

  const initialChat = initialChatResult?.data ?? null
  const totalFiles = treeStructure.data.totalFiles
  const treeNodes = treeStructure.data.treeNodes

  const sessionId = useChatStore((s) => s.sessionId)
  const includeReasoning = useChatStore((s) => s.includeReasoning)
  const { userTask, contextualPrompt, standalonePrompt } = useChatStore(
    useShallow((s) => ({
      userTask: s.userTask,
      contextualPrompt: s.contextualPrompt,
      standalonePrompt: s.standalonePrompt,
    }))
  )
  const { setPrompts } = useChatActions()

  const { selectedFiles, fileContents, images, setFileContents, setImages } =
    useFileExplorerStore(
      useShallow((s) => ({
        selectedFiles: s.selectedFiles,
        fileContents: s.fileContents,
        images: s.images,
        setFileContents: s.setFileContents,
        setImages: s.setImages,
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

  const [showFileExplorer, setShowFileExplorer] = useState(false)
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
          setFileContents(data.fileContents)
          setImages(data.imageFiles)

          const promptBuilder = new PromptBuilder()
            .addSystem(settings.systemPrompt)
            .addContext(data.fileContents)
            .addTask(userTask)

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

  const fileErrors = useMemo(
    () =>
      fileContents
        .filter((file) => file.error)
        .map((file) => `${file.path}: ${file.error}`),
    [fileContents]
  )

  const isReadyToReview = !!standalonePrompt && (!!userTask || !!initialChat)
  const isStreaming = status === "streaming" || status === "submitted"
  const isDisabled = isFetchingFiles || isStreaming || isReadyToReview

  const handleSendToAI = () => {
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
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-foreground" />
          <span className="text-xs font-semibold tracking-tight text-foreground truncate">
            {initialChat?.title || "Nueva Sesión"}
          </span>
        </div>
      </div>

      <ContextBuilder
        treeNodes={treeNodes}
        totalFiles={totalFiles}
        systemPrompt={settings.systemPrompt}
        isDisabled={isDisabled}
        isFetchingFiles={isFetchingFiles}
        showFileExplorer={showFileExplorer}
        setShowFileExplorer={setShowFileExplorer}
        fileErrors={fileErrors}
        fetchFileState={fetchFileState}
        handleFetchFileContents={handleFetchFileContents}
        isReadyToReview={isReadyToReview}
      />

      {isReadyToReview && (
        <PromptReviewer
          isStreaming={isStreaming}
          handleSendToAI={handleSendToAI}
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

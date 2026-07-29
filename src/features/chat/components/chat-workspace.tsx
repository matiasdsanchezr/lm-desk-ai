"use client"

import { SavedChat } from "@/features/chat-history/types/saved-chat"
import { useChatActions, useChatStore } from "@/features/chat/store/chat-store"
import { getFileContents } from "@/features/file-explorer/actions/get-file-contents"
import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import { type FileTreeNode } from "@/features/file-explorer/types/file-tree-node"
import { useSettingsStore } from "@/features/settings/store/settings-store"
import { PromptBuilder } from "@/utils/prompt-builder"
import { useChat } from "@ai-sdk/react"
import { type FileUIPart } from "ai"
import { useRouter } from "next/navigation"
import { useActionState, useMemo, useState } from "react"
import { useShallow } from "zustand/shallow"
import { AIResponseViewer } from "./ai-response-viewer"
import { ContextBuilder } from "./context-builder"
import { GeneratedPrompt } from "./generated-prompt"
import { PromptReviewer } from "./prompt-reviewer"

interface ChatWorkspaceProps {
  totalFiles: number
  treeNodes: FileTreeNode[]
  initialChat?: SavedChat | null
}

export const ChatWorkspace = ({
  totalFiles,
  treeNodes,
  initialChat,
}: ChatWorkspaceProps) => {
  const router = useRouter()
  const [activeChatId, setActiveChatId] = useState<string | undefined>(
    initialChat?.id
  )

  const { userQuery, userPrompt, finalPrompt, includeReasoning } = useChatStore(
    useShallow((s) => ({
      userQuery: s.userQuery,
      userPrompt: s.userPrompt,
      finalPrompt: s.finalPrompt,
      includeReasoning: s.includeReasoning,
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

  const [showFileExplorer, setShowFileExplorer] = useState(true)
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
            .addTask(userQuery)

          setPrompts({
            userPrompt: promptBuilder.buildContextAndTask(),
            finalPrompt: promptBuilder.build(),
          })

          return { error: null }
        }
      },
      { error: null }
    )

  const { messages, status, error, sendMessage, clearError, stop } = useChat({
    messages: initialChat?.messages,
    onFinish: () => {
      if (!initialChat && activeChatId) {
        router.push(`/chat/${activeChatId}`)
      } else {
        router.refresh()
      }
    },
  })

  const fileErrors = useMemo(
    () =>
      fileContents
        .filter((file) => file.error)
        .map((file) => `${file.path}: ${file.error}`),
    [fileContents]
  )

  const isReadyToReview = !!finalPrompt && (!!userQuery || !!initialChat)
  const isStreaming = status === "streaming" || status === "submitted"
  const isDisabled = isFetchingFiles || isStreaming || isReadyToReview

  const handleSendToAI = () => {
    clearError()
    const chatIdToUse = activeChatId ?? `response-${Date.now()}`
    if (!activeChatId) {
      setActiveChatId(chatIdToUse)
    }

    const imageFiles: FileUIPart[] = images.map((i) => ({
      type: "file",
      mediaType: i.mimeType,
      url: `data:${i.mimeType};base64,${i.base64}`,
    }))

    sendMessage(
      { text: userPrompt, files: imageFiles },
      {
        body: {
          chatId: chatIdToUse,
          system: settings.systemPrompt,
          provider: settings.modelConfig.provider,
          model: settings.modelConfig.model,
          temperature: settings.temperature,
          topP: settings.topP,
          selectedFiles,
          userPrompt,
        },
      }
    )
  }

  const handleSendFollowUp = (text: string) => {
    clearError()
    const chatIdToUse = activeChatId ?? `response-${Date.now()}`
    if (!activeChatId) {
      setActiveChatId(chatIdToUse)
    }

    sendMessage(
      { text },
      {
        body: {
          chatId: chatIdToUse,
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
    <div className="mx-auto flex w-full max-w-350 flex-col gap-6">
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
          <AIResponseViewer
            messages={messages}
            error={error}
            isStreaming={isStreaming}
            onSendFollowUp={handleSendFollowUp}
          />
        </div>
      )}
    </div>
  )
}

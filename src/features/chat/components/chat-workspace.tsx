"use client"

import { SavedChat } from "@/features/chat-history/types/saved-chat"
import { useChatStore } from "@/features/chat/store/chat-store"
import { getFileContents } from "@/features/file-explorer/actions/get-file-contents"
import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import { type FileTreeNode } from "@/features/file-explorer/types/file-tree-node"
import { useSettingsStore } from "@/features/settings/store/settings-store"
import { PromptBuilder } from "@/utils/build-prompt"
import { useChat } from "@ai-sdk/react"
import { type FileUIPart } from "ai"
import { useRouter } from "next/navigation"
import { useActionState, useMemo, useState } from "react"
import { useShallow } from "zustand/shallow"
import { AIResponseViewer } from "./ai-response-viewer"
import { ContextBuilder } from "./context-builder"
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

  const { userQuery, resetGeneratedContent, resetAllChat } = useChatStore(
    useShallow((s) => ({
      userQuery: s.userQuery,
      resetGeneratedContent: s.resetGeneratedContent,
      resetAllChat: s.resetAll,
    }))
  )

  const {
    selectedFiles,
    fileContents,
    images,
    setFileContents,
    setImages,
    resetFiles,
  } = useFileExplorerStore(
    useShallow((s) => ({
      selectedFiles: s.selectedFiles,
      fileContents: s.fileContents,
      images: s.images,
      setFileContents: s.setFileContents,
      setImages: s.setImages,
      resetFiles: s.resetFiles,
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
  const [userPrompt, setUserPrompt] = useState(initialChat?.userPrompt ?? "")
  const [finalPrompt, setFinalPrompt] = useState(initialChat?.userPrompt ?? "")
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

          setUserPrompt(promptBuilder.buildContextAndTask())
          setFinalPrompt(promptBuilder.build())

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
    messages: initialChat
      ? [
          {
            id: `${initialChat.id}-user`,
            role: "user",
            parts: [{ type: "text", text: initialChat.userPrompt }],
          },
          {
            id: `${initialChat.id}-assistant`,
            role: "assistant",
            parts: [
              { type: "reasoning", text: initialChat.reasoning ?? "" },
              { type: "text", text: initialChat.response },
            ],
          },
        ]
      : [],
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

  const validFiles = useMemo(
    () => fileContents.filter((f) => !f.error && f.content),
    [fileContents]
  )

  const isReadyToReview = !!finalPrompt && (!!userQuery || !!initialChat)
  const isStreaming = status === "streaming" || status === "submitted"
  const isDisabled = isFetchingFiles || isStreaming || isReadyToReview

  const handleSendToAI = () => {
    clearError()
    setMessages([])

    const files: FileUIPart[] = images.map((i) => ({
      type: "file",
      mediaType: i.mimeType,
      url: `data:${i.mimeType};base64,${i.base64}`,
    }))

    sendMessage(
      { text: userPrompt, files },
      {
        body: {
          system: settings.systemPrompt,
          provider: settings.modelConfig.provider,
          model: settings.modelConfig.model,
          temperature: settings.temperature,
          topP: settings.topP,
          selectedFiles,
          userPrompt,
          userQuery,
        },
      }
    )
  }

  const handleModifyQuery = () => {
    resetGeneratedContent()
    setFinalPrompt("")
  }

  const handleResetAll = () => {
    resetAllChat()
    resetFiles()
    setFinalPrompt("")
    router.push("/chat")
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
          validFiles={validFiles}
          finalPrompt={finalPrompt}
          handleSendToAI={handleSendToAI}
          stop={stop}
          onModifyQuery={handleModifyQuery}
          onResetAll={handleResetAll}
        />
      )}

      {(messages.length > 1 || error) && (
        <div className="space-y-4">
          <AIResponseViewer
            messages={messages}
            error={error}
            isStreaming={isStreaming}
          />
        </div>
      )}
    </div>
  )
}

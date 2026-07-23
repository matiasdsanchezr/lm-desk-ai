"use client"

import { useChatStore } from "@/features/chat/store/chat-store"
import { getFileContents } from "@/features/file-explorer/actions/get-file-contents"
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

interface InitialResponse {
  id: string
  userPrompt: string
  response: string
}

interface ChatWorkspaceProps {
  totalFiles: number
  treeNodes: FileTreeNode[]
  initialResponse?: InitialResponse | null
}

export const ChatWorkspace = ({
  totalFiles,
  treeNodes,
  initialResponse,
}: ChatWorkspaceProps) => {
  const router = useRouter()

  const chatState = useChatStore(
    useShallow((s) => ({
      selectedFiles: s.selectedFiles,
      userQuery: s.userQuery,
      fileContents: s.fileContents,
      imageUrls: s.imageUrls,
      images: s.images,
      setFileContents: s.setFileContents,
      setImages: s.setImages,
      resetChatResult: s.resetChatResult,
      resetAll: s.resetAll,
    }))
  )

  const settings = useSettingsStore(
    useShallow((s) => ({
      config: s.config,
      systemPrompt: s.systemPrompt,
      temperature: s.temperature,
      topP: s.topP,
    }))
  )

  const [showFileExplorer, setShowFileExplorer] = useState(true)
  const [isPromptGenerated, setIsPromptGenerated] = useState(!!initialResponse)
  const [userPrompt, setUserPrompt] = useState(
    initialResponse?.userPrompt ?? ""
  )
  const [finalPrompt, setFinalPrompt] = useState(
    initialResponse?.userPrompt ?? ""
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
          chatState.setFileContents(data.fileContents)
          chatState.setImages(data.imageFiles)

          const promptBuilder = new PromptBuilder()
            .addSystem(settings.systemPrompt)
            .addContext(data.fileContents)
            .addTask(chatState.userQuery)

          setUserPrompt(promptBuilder.buildContextAndTask())
          setFinalPrompt(promptBuilder.build())
          setIsPromptGenerated(true)
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
    messages: initialResponse
      ? [
          {
            id: `${initialResponse.id}-user`,
            role: "user",
            parts: [{ type: "text", text: initialResponse.userPrompt }],
          },
          {
            id: `${initialResponse.id}-assistant`,
            role: "assistant",
            parts: [{ type: "text", text: initialResponse.response }],
          },
        ]
      : [],
    onFinish: () => {
      router.refresh()
    },
  })

  const fileErrors = useMemo(
    () =>
      chatState.fileContents
        .filter((file) => file.error)
        .map((file) => `${file.path}: ${file.error}`),
    [chatState.fileContents]
  )

  const validFiles = useMemo(
    () => chatState.fileContents.filter((f) => !f.error && f.content),
    [chatState.fileContents]
  )

  const isReadyToReview =
    isPromptGenerated && (!!chatState.userQuery || !!initialResponse)
  const isStreaming = status === "streaming" || status === "submitted"
  const isDisabled = isFetchingFiles || isStreaming || isReadyToReview

  const handleSendToAI = () => {
    clearError()
    setMessages([])

    const files: FileUIPart[] = chatState.images.map((i) => ({
      type: "file",
      mediaType: i.mimeType,
      url: `data:${i.mimeType};base64,${i.base64}`,
    }))

    sendMessage(
      { text: userPrompt, files },
      {
        body: {
          system: settings.systemPrompt,
          provider: settings.config.provider,
          model: settings.config.model,
          temperature: settings.temperature,
          topP: settings.topP,
          selectedFiles: chatState.selectedFiles,
          userPrompt: userPrompt,
          userQuery: chatState.userQuery,
        },
      }
    )
  }

  const handleModifyQuery = () => {
    chatState.resetChatResult()
    setIsPromptGenerated(false)
  }

  const handleResetAll = () => {
    chatState.resetAll()
    setIsPromptGenerated(false)
    router.push("/chat")
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
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

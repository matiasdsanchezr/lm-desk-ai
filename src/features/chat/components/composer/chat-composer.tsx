"use client"

import {
  type FileTreeNode,
  useFileExplorerStore,
} from "@/features/file-explorer"
import { useFileExplorerContext } from "@/features/file-explorer/context/file-explorer-context"
import { useWebCrawlerStore } from "@/features/web-crawler/store/web-crawler-store"
import {
  MentionOption,
  TextEditor,
} from "@/shared/components/text-editor/text-editor"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { cn } from "@/shared/lib/utils"
import React, { useCallback, useMemo, useState } from "react"
import { useShallow } from "zustand/shallow"
import { useContextProcessor } from "../../hooks/use-context-processor"
import { useImagePaste } from "../../hooks/use-image-paste"
import { useChatCompletion } from "../../providers/chat-completion-provider"
import { useChatActions, useChatStore } from "../../store/chat-store"
import { ImageUrlsDialog } from "../builder/image-urls-dialog"
import { ChatComposerToolbar } from "./chat-composer-toolbar"
import { ChatPastedImages } from "./chat-pasted-images"

export const ChatComposer = () => {
  const [showImageDialog, setShowImageDialog] = useState(false)
  const { treeNodes } = useFileExplorerContext()
  const { isStreaming, generateContent, stop, messages } = useChatCompletion()
  const { compileContext, isProcessingContext, contextProcessError } =
    useContextProcessor()
  const { handlePaste } = useImagePaste()

  const userTask = useChatStore((s) => s.userTask)
  const includeContext = useChatStore((s) => s.includeContext)
  const includeReasoning = useChatStore((s) => s.includeReasoningHistory)
  const attachedImages = useChatStore((s) => s.attachedImages)

  const { setUserTask, setIncludeContext, setIncludeReasoningHistory } =
    useChatActions()

  const { selectedFilePaths, fileContents, setSelectedFilePaths } =
    useFileExplorerStore(
      useShallow((s) => ({
        selectedFilePaths: s.selectedFilePaths,
        fileContents: s.fileContents,
        setSelectedFilePaths: s.setSelectedFilePaths,
      }))
    )

  const selectedWebUrlsCount = useWebCrawlerStore((s) => s.selectedUrls.length)
  const totalImagesCount = attachedImages.length

  const fileErrors = useMemo(
    () =>
      fileContents
        .filter((file) => file.error)
        .map((file) => `${file.path}: ${file.error}`),
    [fileContents]
  )

  const mentionOptions = useMemo(() => {
    const options: MentionOption[] = []
    const traverse = (node: FileTreeNode) => {
      if (node.isFile && node.filePath) {
        options.push({
          id: node.filePath,
          label: node.name,
          description: node.filePath,
        })
      }
      node.children?.forEach(traverse)
    }
    treeNodes.forEach(traverse)
    return options
  }, [treeNodes])

  const hasSelectedContext =
    selectedFilePaths.length > 0 ||
    totalImagesCount > 0 ||
    selectedWebUrlsCount > 0

  const estimatedTokens = useMemo(() => {
    const taskChars = userTask.length
    const fileChars = fileContents.reduce(
      (acc, f) => acc + (f.content?.length || 0),
      0
    )
    return Math.ceil((taskChars + (includeContext ? fileChars : 0)) / 4)
  }, [userTask, fileContents, includeContext])

  const handleSend = useCallback(async () => {
    const task = userTask.trim()
    if ((!task && totalImagesCount === 0) || isStreaming || isProcessingContext)
      return

    if (includeContext && hasSelectedContext) {
      const { contextualPrompt, error } = await compileContext(task)
      if (error || !contextualPrompt) return
      generateContent(contextualPrompt, true)
    } else {
      generateContent(task, false)
    }

    setUserTask("")
  }, [
    userTask,
    totalImagesCount,
    isStreaming,
    isProcessingContext,
    includeContext,
    hasSelectedContext,
    compileContext,
    generateContent,
    setUserTask,
  ])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleBuildPromptOnly = useCallback(async () => {
    const task = userTask.trim()
    if (!task || isProcessingContext || isStreaming) return
    await compileContext(task)
  }, [userTask, isProcessingContext, isStreaming, compileContext])

  return (
    <>
      <div
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={cn(
          "relative flex min-h-32 flex-col rounded-2xl border border-border/80 bg-card/90 shadow-md backdrop-blur-md transition-all duration-200 sm:min-h-36",
          "focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20",
          isStreaming && "opacity-95"
        )}
      >
        {(fileErrors.length > 0 || contextProcessError) && (
          <div className="space-y-1.5 px-3 pt-2">
            {fileErrors.length > 0 && (
              <Alert
                variant="destructive"
                className="border-destructive/30 bg-destructive/10 py-1 text-xs"
              >
                <span className="icon-[lucide--alert-circle] size-3.5" />
                <AlertDescription className="text-xs">
                  Error al leer {fileErrors.length} archivo(s): {fileErrors[0]}
                </AlertDescription>
              </Alert>
            )}
            {contextProcessError && (
              <Alert
                variant="destructive"
                className="border-destructive/30 bg-destructive/10 py-1 text-xs"
              >
                <span className="icon-[lucide--alert-triangle] size-3.5" />
                <AlertDescription className="text-xs">
                  {contextProcessError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Sección de Miniaturas de Imágenes */}
        <ChatPastedImages disabled={isStreaming} />

        <div className="relative flex min-h-16 flex-1 flex-col px-3 pt-3 pb-2">
          <TextEditor
            value={userTask}
            onChange={setUserTask}
            placeholder="Haz tu pregunta o usa @ para referenciar archivos..."
            className="max-h-56 overflow-y-auto text-xs sm:text-sm"
            disabled={isStreaming || isProcessingContext}
            mentionOptions={mentionOptions}
            onMentionSelect={(filePath) => {
              if (!selectedFilePaths.includes(filePath)) {
                setSelectedFilePaths([...selectedFilePaths, filePath])
              }
            }}
          />
        </div>

        <ChatComposerToolbar
          isStreaming={isStreaming}
          isProcessingContext={isProcessingContext}
          hasSelectedContext={hasSelectedContext}
          includeContext={includeContext}
          includeReasoning={includeReasoning}
          hasMessages={messages.length > 0}
          hasTask={Boolean(userTask.trim()) || totalImagesCount > 0}
          totalImagesCount={totalImagesCount}
          estimatedTokens={estimatedTokens}
          onOpenImageDialog={() => setShowImageDialog(true)}
          onClearTask={() => setUserTask("")}
          onToggleContext={setIncludeContext}
          onToggleReasoning={setIncludeReasoningHistory}
          onBuildPromptOnly={handleBuildPromptOnly}
          onSend={handleSend}
          onStop={stop}
        />
      </div>

      <ImageUrlsDialog
        open={showImageDialog}
        onOpenChange={setShowImageDialog}
        disabled={isStreaming}
      />
    </>
  )
}

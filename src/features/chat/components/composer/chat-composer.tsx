"use client"

import {
  type FileTreeNode,
  useFileExplorerStore,
} from "@/features/file-explorer"
import { useFileExplorerContext } from "@/features/file-explorer/context/file-explorer-context"
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
import { useChatStore } from "../../store/chat-store"
import { estimateTokenCountFromText } from "../../utils/chat-utils"
import { ChatComposerToolbar } from "./chat-composer-toolbar"
import { ChatPastedImages } from "./chat-pasted-images"
import { ImageUrlsDialog } from "./image-urls-dialog"

export const ChatComposer = () => {
  const [showImageDialog, setShowImageDialog] = useState(false)
  const { treeNodes } = useFileExplorerContext()
  const { isStreaming, generateContent, stop, messages } = useChatCompletion()
  const { compileContext, isProcessingContext, contextProcessError } =
    useContextProcessor()
  const { handlePaste } = useImagePaste()

  const {
    userTask,
    includeContext,
    includeReasoningHistory,
    attachedImages,
    setUserTask,
    setIncludeContext,
    setIncludeReasoningHistory,
  } = useChatStore(
    useShallow((s) => ({
      userTask: s.userTask,
      includeContext: s.includeContext,
      includeReasoningHistory: s.includeReasoningHistory,
      attachedImages: s.attachedImages,
      setUserTask: s.setUserTask,
      setIncludeContext: s.setIncludeContext,
      setIncludeReasoningHistory: s.setIncludeReasoningHistory,
    }))
  )

  const { selectedFilePaths, fileContents, setSelectedFilePaths } =
    useFileExplorerStore(
      useShallow((s) => ({
        selectedFilePaths: s.selectedFilePaths,
        fileContents: s.fileContents,
        setSelectedFilePaths: s.setSelectedFilePaths,
      }))
    )

  const totalImagesCount = attachedImages.length

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

  const estimatedTokens = useMemo(() => {
    const filesString = includeContext
      ? fileContents.map((f) => f.content ?? "").join("")
      : ""
    return estimateTokenCountFromText(userTask + filesString)
  }, [userTask, fileContents, includeContext])

  // Envío directo: 1 sola llamada sin intermediarios
  const handleSend = useCallback(() => {
    const task = userTask.trim()
    if ((!task && totalImagesCount === 0) || isStreaming) return

    generateContent(task)
    setUserTask("")
  }, [userTask, totalImagesCount, isStreaming, generateContent, setUserTask])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  // Compilación manual exclusiva para el botón "Compilar prompt"
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
          "relative flex flex-col rounded-2xl border border-border/80 bg-card/90 shadow-md backdrop-blur-md transition-all duration-200",
          "focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20",
          isStreaming && "opacity-95"
        )}
      >
        {contextProcessError && (
          <div className="space-y-1.5 px-3 pt-2">
            <Alert
              variant="destructive"
              className="border-destructive/30 bg-destructive/10 py-1 text-xs"
            >
              <span className="icon-[lucide--alert-triangle] size-3.5" />
              <AlertDescription className="text-xs">
                {contextProcessError}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <ChatPastedImages disabled={isStreaming} />

        <div className="relative flex flex-1 flex-col px-3 pt-2.5 pb-1.5 sm:px-3.5">
          <TextEditor
            value={userTask}
            onChange={setUserTask}
            placeholder="Haz tu pregunta o usa @ para referenciar archivos..."
            className="min-h-6 max-h-56 overflow-y-auto text-xs sm:text-sm"
            disabled={isStreaming}
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
          includeContext={includeContext}
          includeReasoning={includeReasoningHistory}
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

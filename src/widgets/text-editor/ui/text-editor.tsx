"use client"

import { cn } from "@/shared/lib/utils"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
} from "@lexical/react/LexicalTypeaheadMenuPlugin"
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $insertNodes,
  LexicalEditor,
} from "lexical"
import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { createPortal } from "react-dom"
import { $createMentionNode, MentionNode } from "../nodes/mention-node"

export interface MentionOption {
  id: string
  label: string
  description?: string
}

class MentionMenuItem extends MenuOption {
  name: string
  filePath: string

  constructor(name: string, filePath: string) {
    super(name)
    this.name = name
    this.filePath = filePath
  }
}

interface TextEditorProps {
  value: string
  onChange: (val: string) => void
  mentionOptions: MentionOption[]
  onMentionSelect?: (id: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  maxSuggestions?: number
}

function useMentionTriggerMatch(
  trigger: string,
  { minLength = 0, maxLength = 75 } = {}
) {
  return useCallback(
    (text: string) => {
      const triggerIndex = text.lastIndexOf(trigger)
      if (triggerIndex === -1) return null

      if (triggerIndex > 0 && !/\s/.test(text[triggerIndex - 1]!)) {
        return null
      }

      const matchingString = text.slice(triggerIndex + trigger.length)
      const isValid = /^[a-zA-Z0-9_\-./]*$/.test(matchingString)
      if (!isValid) return null

      if (
        matchingString.length >= minLength &&
        matchingString.length <= maxLength
      ) {
        return {
          leadOffset: triggerIndex,
          matchingString,
          replaceableString: text.slice(triggerIndex),
        }
      }

      return null
    },
    [trigger, minLength, maxLength]
  )
}

export const TextEditor = ({
  value,
  onChange,
  mentionOptions,
  onMentionSelect,
  placeholder,
  className,
  disabled,
  maxSuggestions = 20,
}: TextEditorProps) => {
  const [editorInstance, setEditorInstance] = useState<LexicalEditor | null>(
    null
  )
  const [queryString, setQueryString] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const initialConfig = useMemo(
    () => ({
      namespace: "MentionEditor",
      nodes: [MentionNode],
      onError: (error: Error) => console.error(error),
      theme: { paragraph: "m-0" },
      editable: !disabled,
    }),
    [disabled]
  )

  // Optimización: Limitar a maxSuggestions para evitar renders DOM masivos
  const filteredOptions = useMemo(() => {
    let results = mentionOptions

    if (queryString !== null && queryString.trim() !== "") {
      const lowerQuery = queryString.toLowerCase()
      results = mentionOptions.filter(
        (opt) =>
          opt.label.toLowerCase().includes(lowerQuery) ||
          (opt.description &&
            opt.description.toLowerCase().includes(lowerQuery))
      )
    }

    return results
      .slice(0, maxSuggestions)
      .map((opt) => new MentionMenuItem(opt.label, opt.id))
  }, [mentionOptions, queryString, maxSuggestions])

  const checkForTriggerMatch = useMentionTriggerMatch("@", { minLength: 0 })

  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
    },
    []
  )

  return (
    <div
      className={cn(
        "relative w-full rounded-md border border-input bg-background text-sm",
        "ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        "transition-colors",
        disabled
          ? "cursor-not-allowed border-dashed bg-muted/30 opacity-60"
          : "hover:border-input/80"
      )}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative min-h-30 px-3 py-2">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                onDragStart={handleDragStart}
                className={cn(
                  "min-h-30 resize-y wrap-break-word whitespace-pre-wrap outline-none",
                  disabled && "cursor-not-allowed",
                  className
                )}
                aria-label="Editor de consultas para el LLM"
                aria-readonly={disabled}
                aria-disabled={disabled}
              />
            }
            placeholder={
              <div className="pointer-events-none absolute top-2 left-3 text-muted-foreground select-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />

          <HistoryPlugin />

          <OnChangePlugin
            onChange={(editorState) => {
              editorState.read(() => {
                const plainText = $getRoot().getTextContent()
                if (plainText !== value) {
                  // Transición no bloqueante para mantener fluida la escritura
                  startTransition(() => {
                    onChange(plainText)
                  })
                }
              })
            }}
          />

          <EditorCapturePlugin onInit={setEditorInstance} />
          <DisablePlugin disabled={disabled} />
          <SyncValuePlugin value={value} mentionOptions={mentionOptions} />

          <LexicalTypeaheadMenuPlugin<MentionMenuItem>
            onQueryChange={setQueryString}
            onSelectOption={(option, userTriggerAnchor, closeMenu) => {
              if (editorInstance) {
                editorInstance.update(() => {
                  const mentionNode = $createMentionNode(
                    option.name,
                    option.filePath
                  )
                  if (userTriggerAnchor) {
                    userTriggerAnchor.remove()
                  }
                  const spaceNode = $createTextNode(" ")
                  $insertNodes([mentionNode, spaceNode])
                  closeMenu()
                  if (onMentionSelect) onMentionSelect(option.filePath)
                })
              }
            }}
            triggerFn={checkForTriggerMatch}
            options={filteredOptions}
            menuRenderFn={(
              anchorElementRef,
              { selectOptionAndCleanUp, selectedIndex, options }
            ) => {
              if (!anchorElementRef.current || options.length === 0) return null

              const rect = anchorElementRef.current.getBoundingClientRect()
              const viewportPadding = 8
              const menuGap = 6
              const preferredMenuWidth = 320
              const preferredMenuHeight = 192

              const viewportWidth = window.innerWidth
              const viewportHeight = window.innerHeight

              const menuWidth = Math.min(
                preferredMenuWidth,
                viewportWidth - viewportPadding * 2
              )
              const availableBelow = Math.max(
                0,
                viewportHeight - rect.bottom - viewportPadding - menuGap
              )
              const availableAbove = Math.max(
                0,
                rect.top - viewportPadding - menuGap
              )

              const shouldOpenAbove =
                availableBelow < preferredMenuHeight &&
                availableAbove > availableBelow

              const availableHeight = shouldOpenAbove
                ? availableAbove
                : availableBelow

              if (availableHeight <= 0) return null

              const left = Math.max(
                viewportPadding,
                Math.min(rect.left, viewportWidth - menuWidth - viewportPadding)
              )
              const top = shouldOpenAbove
                ? rect.top - menuGap
                : rect.bottom + menuGap

              return createPortal(
                <div
                  role="listbox"
                  aria-label="Sugerencias de archivos"
                  className="fixed z-50 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                  style={{
                    top,
                    left,
                    width: menuWidth,
                    maxHeight: Math.min(preferredMenuHeight, availableHeight),
                    transform: shouldOpenAbove
                      ? "translateY(-100%)"
                      : undefined,
                  }}
                >
                  {options.map((option, idx) => (
                    <button
                      key={option.filePath}
                      type="button"
                      role="option"
                      aria-selected={idx === selectedIndex}
                      onMouseDown={(event) => {
                        event.preventDefault()
                        selectOptionAndCleanUp(option)
                      }}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-sm px-2.5 py-1.5 text-left outline-none select-none hover:bg-accent hover:text-accent-foreground",
                        idx === selectedIndex &&
                          "bg-accent text-accent-foreground"
                      )}
                    >
                      <span className="mt-0.5 icon-[fa7-solid--file] shrink-0 text-muted-foreground" />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate font-mono text-xs font-medium">
                          {option.name}
                        </span>
                        <span className="truncate text-[10px] text-muted-foreground">
                          {option.filePath}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>,
                document.body
              )
            }}
          />
        </div>
      </LexicalComposer>
    </div>
  )
}

// --- PLUGINS AUXILIARES OPTIMIZADOS ---

function EditorCapturePlugin({
  onInit,
}: {
  onInit: (editor: LexicalEditor) => void
}) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    onInit(editor)
  }, [editor, onInit])
  return null
}

function DisablePlugin({ disabled }: { disabled?: boolean }) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    editor.setEditable(!disabled)
  }, [editor, disabled])
  return null
}

function SyncValuePlugin({
  value,
  mentionOptions,
}: {
  value: string
  mentionOptions: MentionOption[]
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot()
      const currentText = root.getTextContent()
      const isFocused = editor.getRootElement() === document.activeElement

      if (isFocused || value === currentText) return

      root.clear()
      const paragraph = $createParagraphNode()

      if (!value) {
        root.append(paragraph)
        return
      }

      const optionsMap = new Map<string, MentionOption>()
      for (const opt of mentionOptions) {
        optionsMap.set(opt.label, opt)
      }

      const regex = /(@[a-zA-Z0-9_\-./]+)/g
      const parts = value.split(regex)

      for (const part of parts) {
        if (!part) continue

        if (part.startsWith("@")) {
          const labelCandidate = part.slice(1)
          const matchedOption = optionsMap.get(labelCandidate)

          if (matchedOption) {
            paragraph.append(
              $createMentionNode(matchedOption.label, matchedOption.id)
            )
            continue
          }
        }
        paragraph.append($createTextNode(part))
      }

      root.append(paragraph)
    })
  }, [editor, value, mentionOptions])

  return null
}

"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useCallback, useMemo, useRef, useState } from "react"
import { useShallow } from "zustand/shallow"
import { useCrawlAction } from "../hooks/use-crawl-action"
import { useWebCrawlerStore } from "../store/web-crawler-store"
import type { CrawledPageNode } from "../types"
import { CrawledPagePreviewDialog } from "./crawled-page-preview-dialog"

interface WebCrawlerPanelProps {
  disabled?: boolean
  onStartCrawl?: () => void
}

export function WebCrawlerPanel({
  disabled = false,
  onStartCrawl,
}: WebCrawlerPanelProps) {
  const {
    inputUrls,
    crawledPages,
    selectedUrls,
    isCrawling,
    setInputUrls,
    toggleUrlSelection,
    clearSelectedUrls,
    selectAllPages,
  } = useWebCrawlerStore(
    useShallow((s) => ({
      inputUrls: s.inputUrls,
      crawledPages: s.crawledPages,
      selectedUrls: s.selectedUrls,
      isCrawling: s.isCrawling,
      setInputUrls: s.setInputUrls,
      toggleUrlSelection: s.toggleUrlSelection,
      clearSelectedUrls: s.clearSelectedUrls,
      selectAllPages: s.selectAllPages,
    }))
  )

  // Hook de Server Action con Playwright
  const { handleStartCrawl, isLoading } = useCrawlAction()

  const [activeTab, setActiveTab] = useState<"input" | "crawled">("input")
  const [previewPage, setPreviewPage] = useState<CrawledPageNode | null>(null)

  const parsedUrlsCount = useMemo(() => {
    return inputUrls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean).length
  }, [inputUrls])

  const selectedScrollRef = useRef<HTMLDivElement>(null)
  const getSelectedScrollElement = useCallback(
    () => selectedScrollRef.current,
    []
  )

  const selectedVirtualizer = useVirtualizer({
    count: crawledPages.length,
    getScrollElement: getSelectedScrollElement,
    estimateSize: () => 68,
    overscan: 5,
    measureElement:
      typeof window !== "undefined"
        ? (el: Element) => el.getBoundingClientRect().height
        : undefined,
  })

  const measureElement = useCallback(
    (el: HTMLDivElement | null) => {
      selectedVirtualizer.measureElement(el)
    },
    [selectedVirtualizer]
  )

  // Ejecuta la extracción de Playwright y cambia la pestaña visual en móvil
  const startCrawl = () => {
    handleStartCrawl()
    if (onStartCrawl) onStartCrawl()
    setActiveTab("crawled")
  }

  const isBusy = isCrawling || isLoading

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Tab Selector en versión Móvil */}
        <div className="flex gap-1 rounded-lg bg-muted p-1 md:hidden">
          <Button
            type="button"
            onClick={() => setActiveTab("input")}
            variant={activeTab === "input" ? "default" : "ghost"}
            className="flex-1 text-xs"
            size="sm"
          >
            <span className="mr-1.5 icon-[fa7-solid--globe] h-3.5 w-3.5" />
            Ingresar URLs
            <Badge variant="secondary" className="ml-1.5 text-[10px]">
              {parsedUrlsCount}
            </Badge>
          </Button>
          <Button
            type="button"
            onClick={() => setActiveTab("crawled")}
            variant={activeTab === "crawled" ? "default" : "ghost"}
            className="flex-1 text-xs"
            size="sm"
          >
            <span className="mr-1.5 icon-[fa7-solid--spider] h-3.5 w-3.5" />
            Extraídas
            <Badge variant="secondary" className="ml-1.5 text-[10px]">
              {selectedUrls.length}
            </Badge>
          </Button>
        </div>

        <div className="flex min-h-75 flex-col overflow-hidden rounded-xl border bg-card md:h-125 md:flex-row">
          {/* PANEL IZQUIERDO: Ingreso de URLs */}
          <div
            className={cn(
              "flex flex-1 flex-col border-b md:w-1/2 md:border-r md:border-b-0 lg:w-2/5",
              activeTab === "input" ? "flex" : "hidden md:flex"
            )}
          >
            <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
              <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="icon-[fa7-solid--globe] h-4 w-4 text-primary" />
                URLs de Origen
              </span>
              <Badge variant="secondary" className="text-xs">
                {parsedUrlsCount} lista(s)
              </Badge>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label
                  htmlFor="crawler-urls-input"
                  className="text-xs text-muted-foreground"
                >
                  Ingresa una dirección URL por línea:
                </Label>
                <Textarea
                  id="crawler-urls-input"
                  value={inputUrls}
                  onChange={(e) => setInputUrls(e.target.value)}
                  placeholder={`https://ejemplo.com/docs\nhttps://ejemplo.com/blog/articulo-1`}
                  className="min-h-48 flex-1 resize-none font-mono text-xs"
                  disabled={disabled || isBusy}
                />
              </div>

              <Button
                type="button"
                onClick={startCrawl}
                disabled={disabled || isBusy || parsedUrlsCount === 0}
                className="w-full gap-2 text-xs font-semibold"
                size="sm"
              >
                {isBusy ? (
                  <>
                    <span className="icon-[fa7-solid--spinner] h-3.5 w-3.5 animate-spin" />
                    Rastreando sitios web...
                  </>
                ) : (
                  <>
                    <span className="icon-[fa7-solid--spider] h-3.5 w-3.5" />
                    Iniciar Rastro y Extracción
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* PANEL DERECHO: Páginas Extraídas y Selección */}
          <div
            className={cn(
              "flex flex-1 flex-col md:w-1/2 lg:w-3/5",
              activeTab === "crawled" ? "flex" : "hidden md:flex"
            )}
          >
            <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="icon-[fa7-solid--square-check] h-4 w-4" />
                Páginas procesadas
              </span>
              <div className="flex items-center gap-2">
                {crawledPages.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={selectAllPages}
                    disabled={disabled || isBusy}
                  >
                    Seleccionar todo
                  </Button>
                )}
                <Badge variant="secondary">{selectedUrls.length}</Badge>

                {selectedUrls.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:text-destructive md:h-auto md:w-auto md:px-2"
                          disabled={disabled || isBusy}
                        >
                          <span className="icon-[fa7-solid--trash] h-4 w-4 md:mr-1.5" />
                          <span className="hidden text-xs md:inline">
                            Limpiar
                          </span>
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          ¿Desmarcar páginas seleccionadas?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Se quitarán {selectedUrls.length} páginas del contexto
                          de la consulta.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={clearSelectedUrls}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            <div
              ref={selectedScrollRef}
              className="flex-1 overflow-y-auto px-3"
            >
              {crawledPages.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-3 text-muted-foreground">
                  <span className="icon-[fa7-solid--link] h-8 w-8 opacity-50" />
                  <p className="px-4 text-center text-sm">
                    Ingresa las URLs y ejecuta la extracción para visualizar el
                    contenido apto para LLM.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    height: `${selectedVirtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                    marginTop: "12px",
                  }}
                >
                  {selectedVirtualizer.getVirtualItems().map((virtualRow) => {
                    const page = crawledPages[virtualRow.index]!
                    const isChecked = selectedUrls.includes(page.url)
                    const hasContent = Boolean(
                      page.content && page.content.trim().length > 0
                    )

                    return (
                      <div
                        key={page.url}
                        ref={measureElement}
                        data-index={virtualRow.index}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualRow.start}px)`,
                          paddingBottom: "6px",
                        }}
                      >
                        <div
                          onClick={() =>
                            page.status === "success" &&
                            toggleUrlSelection(page.url)
                          }
                          className={cn(
                            "group relative flex cursor-pointer items-center justify-between gap-3 rounded-md border bg-card p-2.5 transition-all hover:border-primary/20 hover:shadow-xs",
                            isChecked && "border-primary/40 bg-primary/5"
                          )}
                        >
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="icon-[fa7-solid--file-lines] h-3.5 w-3.5 shrink-0 text-primary" />
                              <span className="truncate text-[13px] font-medium">
                                {page.title || page.url}
                              </span>
                              {hasContent && (
                                <span className="hidden text-[10px] font-medium text-muted-foreground sm:inline-block">
                                  ({page.content!.length.toLocaleString()}{" "}
                                  carac.)
                                </span>
                              )}
                            </div>
                            <span
                              title={page.url}
                              className="truncate pl-5 font-mono text-[10px] text-muted-foreground"
                            >
                              {page.url}
                            </span>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5">
                            {page.status === "crawling" && (
                              <span className="icon-[fa7-solid--spinner] h-3.5 w-3.5 animate-spin text-muted-foreground" />
                            )}
                            {page.status === "error" && (
                              <Badge
                                variant="destructive"
                                className="text-[10px]"
                                title={page.errorMessage}
                              >
                                Error
                              </Badge>
                            )}
                            {page.status === "success" && (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setPreviewPage(page)
                                  }}
                                  title="Ver contenido extraído"
                                  aria-label={`Ver contenido de ${page.title || page.url}`}
                                >
                                  <span className="icon-[fa7-solid--eye] h-3.5 w-3.5" />
                                </Button>
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() =>
                                    toggleUrlSelection(page.url)
                                  }
                                  disabled={disabled || isBusy}
                                  className="h-4 w-4"
                                  aria-label={`Seleccionar ${page.title}`}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CrawledPagePreviewDialog
        page={previewPage}
        open={Boolean(previewPage)}
        onOpenChange={(open) => {
          if (!open) setPreviewPage(null)
        }}
      />
    </>
  )
}

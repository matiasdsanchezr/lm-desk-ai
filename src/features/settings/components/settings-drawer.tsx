import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { loadPrompts } from "../actions/prompt"
import { InstructionsMenu } from "../components/instructions-menu"
import { ModelParameters } from "../components/model-parameters"
import { ProviderMenu } from "../components/provider-menu"

// Async Server Component: realiza el fetch de prompts de forma asíncrona sin bloquear el layout principal
export async function SettingsDrawer() {
  const initialPromptsResult = await loadPrompts()
  const initialPrompts = initialPromptsResult.data || []

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="fixed top-3 right-3 z-50 h-10 w-10 rounded-full border-border/40 bg-background/80 text-muted-foreground shadow-sm backdrop-blur-md transition-all active:scale-95 hover:bg-accent hover:text-foreground md:top-4 md:right-4 md:h-9 md:w-9"
          >
            <span className="icon-[fa6-solid--sliders] h-4 w-4" />
            <span className="sr-only">Configuración de LLM</span>
          </Button>
        }
      />

      <SheetContent
        side="right"
        className="flex h-dvh w-full flex-col gap-0 border-l border-border/40 bg-background p-0 sm:max-w-md"
      >
        <SheetHeader className="shrink-0 border-b border-border/40 px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
          <div className="flex items-center gap-3 pr-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-muted/30 text-muted-foreground">
              <span className="icon-[fa6-solid--sliders] h-4 w-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <SheetTitle className="truncate text-sm font-semibold tracking-tight sm:text-base">
                Configuración del Modelo
              </SheetTitle>
              <SheetDescription className="truncate text-xs text-muted-foreground">
                Ajusta los parámetros del modelo de lenguaje.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-5 pb-10 sm:gap-8 sm:px-6 sm:py-6 sm:pb-6">
          <section className="space-y-3">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold tracking-tight text-foreground uppercase sm:text-sm">
                Motor de Inferencia
              </h4>
              <p className="text-xs text-muted-foreground">
                Selecciona la infraestructura y modelo para ejecutar las
                peticiones.
              </p>
            </div>
            <ProviderMenu />
          </section>

          <Separator className="bg-border/40" />

          <section className="space-y-3">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold tracking-tight text-foreground uppercase sm:text-sm">
                Parámetros
              </h4>
              <p className="text-xs text-muted-foreground">
                Modifica la creatividad y consistencia del modelo.
              </p>
            </div>
            <ModelParameters />
          </section>

          <Separator className="bg-border/40" />

          <section className="space-y-3">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold tracking-tight text-foreground uppercase sm:text-sm">
                Personalización
              </h4>
              <p className="text-xs text-muted-foreground">
                Define el rol y contexto del sistema.
              </p>
            </div>
            <InstructionsMenu availablePrompts={initialPrompts} />
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}

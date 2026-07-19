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
import { loadPrompts } from "@/features/settings/actions/prompt"
import { InstructionsMenu } from "../components/instructions-menu"
import { ModelParameters } from "../components/model-parameters"
import { ProviderMenu } from "../components/provider-menu"

export async function SettingsDrawer() {
  const initialPrompts = await loadPrompts()

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="fixed top-3 right-4 z-50 h-9 w-9 rounded-full border-border/40 bg-background/70 text-muted-foreground backdrop-blur-md transition-colors hover:bg-accent hover:text-foreground"
          >
            <span className="icon-[fa6-solid--sliders] h-4 w-4" />
            <span className="sr-only">Configuración de LLM</span>
          </Button>
        }
      />

      <SheetContent className="flex h-full w-full flex-col gap-0 border-l border-border/40 bg-background p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b border-border/40 px-6 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 text-muted-foreground">
              <span className="icon-[fa6-solid--sliders] h-3.5 w-3.5" />
            </div>
            <div className="space-y-0.5">
              <SheetTitle className="text-sm font-medium tracking-tight">
                Configuración del Modelo
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Ajusta los parámetros del modelo de lenguaje.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 py-6">
          <section className="space-y-3">
            <div className="space-y-1">
              <h4 className="text-sm font-medium tracking-tight text-foreground">
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
              <h4 className="text-sm font-medium tracking-tight text-foreground">
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
              <h4 className="text-sm font-medium tracking-tight text-foreground">
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

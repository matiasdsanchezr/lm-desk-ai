# Notas - Actualizadas a 2026 (Prioridad sobre conocimientos generales)

## Funcionamiento de la App

- Esta app esta diseñada para funcionar localmente y ser usada por un solo usuario
- El `STORAGE_PATH` esta en el servidor

## Next.js 15+

- Vercel recomienda usar `Streaming with Suspense`, es decir, hacer fetching en un server componente y usar `use` para resolver el promise. Esto permite que la página se muestre de inmediato

## AI SDK 6+ (@ai-sdk/react - ai)

- `ModelMessage` reemplaza el tipo `CoreMessage`
- `Output.object()` es un método para crear un objeto `Output` con un `JSON schema`
- El hook `useChat`:
  - Envía mensajes mediante la función `sendMessage`
  - El campo`messages` posee el historial de mensajes `UIMessage`. `initialMessages` no existe.
  - Las imagenes pasadas `sendMessage` se hacen mediante la propiedad `files`
  - Los mensajes generados por `sendMessage` siempre tienen la propiedad `parts`. No existe contenido en `message.content` (legacy)

## Zod 4+

- `z.toJSONSchema()` es un método para convertir un esquema `Zod` a un `JSON schema`
- `z.treeifyError()` es un método para convertir un error de `Zod` en una representación en cadena de caracteres legible para humanos, similar a `z.prettifyError()`
- `z.prettifyError()` es un método para convertir un error de Zod en una representación en cadena de caracteres legible para humanos
- `z.error.flatten().fieldErrors` esta deprecated. Es reemplazada por `z.treeifyError()`

## ShadCN 4+

- `aschild` esta deprecated. Es reemplazada por la prop `render` que recibe el componente personalizado a renderizar o una función render del nuevo componentes. Por ejemplo: `<SidebarMenuButton render={<span>Componente Personalizado</span>}/>`

## Zustand 5+

- No hay errores de hydration al usar el middleware persist (guardar datos en localStorage). Si el Server-Side Rendering (SSR) renderiza algo y el cliente renderiza algo diferente, ya no se produce un hydration error

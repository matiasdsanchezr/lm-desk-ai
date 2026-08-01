# Notas - Actualizadas a 2026 (Prioridad sobre conocimientos generales)

## Funcionamiento de la App

- Esta app esta diseñada para funcionar localmente y ser usada por un solo usuario
- El `STORAGE_PATH` esta en el servidor

## AI SDK 7+

- `ModelMessage` reemplaza el tipo `CoreMessage`
- `Output.object()` es un método para crear un objeto `Output` con un `JSON schema`
- El hook `useChat` envia mensajes mediante la función `sendMessage`
- Las imagenes pasadas en el hook `useChat` se hacen mediante la propiedad `files`
- Los mensajes generados por `sendMessage()` siempre tienen la propiedad `parts`. No existe contenido en `message.content`

## Zod 4+

- `z.toJSONSchema()` es un método para convertir un esquema `Zod` a un `JSON schema`
- `z.treeifyError()` es un método para convertir un error de `Zod` en un arbol de errores con los mensajes de errores
- `z.prettifyError()` es un método para convertir un error de Zod en una representación en cadena de caracteres legible e imprimibles
- `z.error.flatten().fieldErrors` esta deprecated. Es reemplazada por `z.treeifyError()`

## ShadCN 4+

- `aschild` esta deprecated. Es reemplazada por la prop `render` que recibe el componente personalizado a renderizar o una función render del nuevo componentes. Por ejemplo: `<SidebarMenuButton render={<span>Componente Personalizado</span>}/>`

## Zustand 5+

- No hay errores de hydration al usar el middleware persist (guardar datos en localStorage). Si el Server-Side Rendering (SSR) renderiza algo y el cliente renderiza algo diferente, ya no se produce un hydration error

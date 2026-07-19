# Notas sobre la aplicación

- Esta app esta diseñada para funcionar localmente y ser usada por un solo usuario
- El STORAGE_PATH esta en la pc y esta pensada para ser usado en el servidor solamente

# Notas sobre librerias actualizadas

## AI SDK v7

- ModelMessage reemplaza el tipo CoreMessage
- Output.object() es un método para crear un objeto Output con un JSON schema
- El hook useChat envia mensajes mediante la función `sendMessage`
- Las imagenes pasadas en el hook `useChat` se hacen mediante la propiedad `files`

## Zod v4

- z.toJSONSchema() es un método para convertir un Zod schema a un JSON schema

## z.prettifyError()

Esto `z.prettifyError()` proporciona una representación en cadena de caracteres legible para humanos del error al usar `schema.safeParse`

const pretty = z.prettifyError(result.error);

## ShadCN 4+

- La prop `aschild` de los componentes de ShadCN ya no exite, ahora es reemplazada por la prop `render` que recibe el componente personalizado a renderizar: `React.ReactElement | render function`. Por ejemplo:

```tsx
<SidebarMenuButton
  render={
    <div>
      <span>{resp.title}</span>
    </div>
  }
/>
```

## Zustand 5+

- No hay errores de hydration al usar el middleware persist (guardar datos en localStorage). Incluso el Server-Side Rendering (SSR) renderiza algo y el cliente renderiza algo diferente, lo cual es correcto.

# LM Desk 🤖💻

> **Context-First, Agent-Optional** — Entorno de escritorio y web local para la selección inteligente de contexto, resolución de dependencias e inferencia determinista con Modelos de Lenguaje Grande (LLMs).

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-green.svg?style=flat-square)](LICENSE)

---

## 📸 Capturas de Pantalla

<table>
  <tr>
    <td align="center" width="50%">
      <b>Entorno de Chat e Inferencia</b>
      <br><br>
      <img src="https://i.imgur.com/pGC3ZxI.png" alt="Chat Workspace" width="420" />
    </td>
    <td align="center" width="50%">
      <b>Explorador Virtualizado de Archivos</b>
      <br><br>
      <img src="https://i.imgur.com/gcXayas.png" alt="File Explorer Modal" width="420" />
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <b>Revisión de Prompt XML / Markdown</b>
      <br><br>
      <img src="https://i.imgur.com/8orGNTV.png" alt="Prompt Reviewer" width="420" />
    </td>
    <td align="center" width="50%">
      <b>Configuración de Proveedores e Instrucciones</b>
      <br><br>
      <img src="https://i.imgur.com/A7lydZc.png" alt="Settings Drawer" width="420" />
    </td>
  </tr>
  <tr>
    <td align="center" colspan="2">
      <b>Resultado de Inferencia y Razonamiento</b>
      <br><br>
      <img src="https://i.imgur.com/MrrP7SD.png" alt="Chat Result" width="680" />
    </td>
  </tr>
</table>

---

## 📖 Descripción

**LM Desk** es una herramienta local diseñada para optimizar el flujo de trabajo entre desarrolladores e Inteligencia Artificial. Resuelve el dilema de la preparación manual de prompts y el consumo desmedido de tokens ocasionado por los agentes CLI automatizados.

Con LM Desk, el desarrollador mantiene **control total sobre el contexto**: permite explorar repositorios de código local, seleccionar únicamente los archivos requeridos, resolver automáticamente dependencias asociadas (`imports`), adjuntar imágenes de soporte y generar prompts estructurados en bloques XML/Markdown ideales para modelos de razonamiento (ej. _Claude 3.5 Sonnet, DeepSeek R1, Gemini 2.5 Pro, GPT-4o_).

---

## ✨ Funcionalidades Principales

- 📁 **Explorador Virtualizado y Grafo de Dependencias:** Renderizado fluido a 60fps con `@tanstack/react-virtual` capaz de procesar miles de nodos. Analiza declaraciones `import` en el código para resolver e incluir dependencias automáticas.
- 🏷️ **Editor Lexical con Autocompletado (`@`):** Editor WYSIWYG que despliega un menú flotante al presionar `@` para vincular dinámicamente archivos del proyecto al contexto.
- 🖼️ **Adjuntos Multimodales:** Integración de imágenes locales codificadas en Base64 o mediante URLs externas para consultas visuales a modelos compatibles.
- 📝 **Generador y Revisor Dual de Prompts:** Empaqueta las instrucciones del sistema, los archivos encapsulados en etiquetas `<file path="...">` y la consulta del usuario. Incluye estimador de caracteres y conteo aproximado de tokens (`~caracteres / 4`).
- ⚡ **Motor Inferencia Multi-Proveedor:** Integración directa streaming con OpenAI, Google Vertex AI, Google GenAI, NVIDIA NIM, OpenRouter y proxies compatibles (Antigravity).
- 🧠 **Soporte de Bloques de Razonamiento ("Thinking Blocks"):** Visualización colapsable separada en tiempo real de cadenas de pensamiento transmitidas por modelos como DeepSeek R1.
- 💬 **Espacio de Chat Interactivo Multi-Turno:** Soporta preguntas de seguimiento, edición/eliminación de turnos previos y control directo sobre la inclusión del historial de razonamiento.
- 💾 **Persistencia Local y Plantillas:** Almacenamiento local en JSON (`STORAGE_PATH/chats`) e interfaz para gestionar plantillas de instrucciones del sistema en archivos Markdown (`STORAGE_PATH/prompts`).

---

## 🛠️ Tecnologías Utilizadas

### Frontend & UI

- **Next.js 16 (App Router)** & **React 19**
- **Tailwind CSS v4** con soporte nativo de modo oscuro.
- **Shadcn UI** & **Base UI** con iconos de Lucide e Iconify.
- **Lexical Editor (`@lexical/react`)** para autocompletado de menciones.
- **Streamdown (`streamdown`, `@streamdown/code`)** para el renderizado streaming de respuestas Markdown y bloques de código con sintaxis resaltada.

### Backend & Estado

- **Vercel AI SDK 7+ (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`, `@ai-sdk/google`, etc.)**
- **Zustand 5** (Gestión de estado en cliente sin errores de hidratación en SSR).
- **Zod 4+** (Validación estricta de esquemas de API y Server Actions).
- **Node.js `fs/promises` & `path`** con control de concurrencia (límite de 20 lecturas simultáneas) y validación de _Path Traversal_.

---

## 📋 Requisitos Previos

- **Node.js**: `v20.0.0` o superior.
- **Gestor de paquetes**: `npm`, `pnpm`, `yarn` o `bun`.
- **Claves de API** (al menos una según el proveedor a utilizar):
  - OpenAI, Google Vertex AI, Google GenAI, NVIDIA NIM, OpenRouter, etc.

---

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/matiasdsanchezr/lm-desk-ai.git
cd lm-desk-ai
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto basándote en la siguiente plantilla:

```env
# Ruta absoluta donde se guardará el historial de chats y las plantillas (.md)
STORAGE_PATH=/tu/ruta/local/lm-desk-data

# Configuración opcional de Proveedores (Ingresa la API Key del proveedor que utilices)
NVIDIA_NIM_API_KEY=nvapi-...
OPENAI_API_KEY=sk-...
OPEN_ROUTER_API_KEY=sk-or-...
GENAI_API_KEY=AIzaSy...
VERTEX_API_KEY=...
ANTIGRAVITY_BASE_URL=...
ANTIGRAVITY_API_KEY=...
TARGET_PROJECT_PATH=ruta/del/directorio/a/trabajar
```

---

## 💻 Modo de Uso

### Desarrollo Local

Para ejecutar LM Desk indicando el proyecto objetivo que deseas analizar, utiliza la bandera `-t` (o `--target`):

```bash
npm run dev -- -t /ruta/a/tu/proyecto-codigo
```

Alternativamente, puedes especificar la variable `TARGET_PROJECT_PATH` en tu entorno o `.env.local`:

```bash
export TARGET_PROJECT_PATH=/ruta/a/tu/proyecto-codigo
npm run dev
```

Navega a [http://localhost:3000](http://localhost:3000) en tu navegador.

### Compilación y Producción

```bash
# Compilar la aplicación Next.js
npm run build

# Iniciar en modo producción apuntando al proyecto objetivo
npm start -- -t /ruta/a/tu/proyecto-codigo
```

---

## 🔄 Flujo de Trabajo Recomendado

1. **Seleccionar Contexto:** Abre el explorador de archivos en el panel principal y marca los componentes o archivos relevantes. Activa _"Incluir dependencias"_ si necesitas resolver los `imports` automáticos.
2. **Redactar Instrucción:** En el editor de texto, redacta tu requerimiento. Usa `@` para autocompletar e insertar archivos específicos directamente en la consulta.
3. **Revisar y Generar:** Haz clic en **"Generar y revisar prompt"**. Puedes copiar el bloque unificado en formato XML para llevarlo a plataformas web externas o presionar **"Generar Respuesta"** para procesarlo mediante la API configurada.
4. **Seguimiento e Iteración:** Continúa la conversación realizando preguntas de seguimiento, editando o eliminando turnos anteriores según lo requieras.

---

## 🛡️ Seguridad

LM Desk implementa una función estricta de sanitización y aislamiento de rutas (`validateAndSanitizePath`). Todas las operaciones de lectura de archivos locales o imágenes están acotadas exclusivamente al directorio raíz configurado en `TARGET_PROJECT_PATH`, denegando cualquier intento de _Path Traversal_.

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más información.

```

```

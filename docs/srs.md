# Software Requirements Specification (SRS)

## Proyecto: LM Desk (Contexto Inteligente para LLMs)

---

## 1. Introducción

### 1.1 Propósito

Este documento define los requisitos funcionales, no funcionales y de sistema para la aplicación **LM Desk**, una herramienta de escritorio y entorno web local diseñada para optimizar la preparación de contexto de código fuente, la adjunción de recursos multimodales y la interacción determinista con Modelos de Lenguaje Grande (LLMs).

### 1.2 Alcance del Producto

LM Desk permite a desarrolladores de software:

- Explorar de forma interactiva la estructura jerárquica de archivos de un proyecto local objetivo.
- Resolver e incluir automáticamente grafos de dependencias directas (`imports`) del código fuente seleccionado.
- Cargar e integrar recursos visuales (imágenes locales o vía URLs externas en formato Base64) al contexto de consulta.
- Redactar instrucciones mediante un editor con autocompletado y vinculación dinámica de código usando menciones (`@nombre_archivo`).
- Compilar prompts estructurados en bloques XML/Markdown legibles por arquitecturas de razonamiento profundo (ej. Claude 3.5 Sonnet, DeepSeek R1, Gemini 2.5 Pro, GPT-4o).
- Ejecutar inferencias en tiempo real (streaming) con visualización colapsable de cadenas de razonamiento ("thinking blocks") a través de múltiples proveedores.
- Mantener un espacio de chat interactivo multi-turno que permite la edición de consultas pasadas, modificación de respuestas del asistente, eliminación de turnos y activación/desactivación del razonamiento acumulado en preguntas de seguimiento.
- Gestionar localmente un historial de análisis y plantillas Markdown personalizadas para instrucciones del sistema.

### 1.3 Glosario

- **LLM (Large Language Model):** Modelo de inteligencia artificial especializado en procesamiento y generación de lenguaje natural y código.
- **Prompt:** Instrucción estructurada provista a un LLM para guiar su respuesta.
- **RSC (React Server Components):** Componentes de React que se ejecutan exclusivamente en el servidor dentro de Next.js App Router.
- **System Prompt (Instrucción del Sistema):** Directrices globales de comportamiento aplicadas al modelo de IA antes de procesar las consultas.
- **Reasoning / Thinking Block:** Cadena de pensamiento intermedia transmitida en streaming por modelos de razonamiento (ej. DeepSeek R1).
- **FileUIPart / Multimodal Part:** Estructura normalizada de Vercel AI SDK para transmitir archivos e imágenes codificados en Base64.
- **Token:** Unidad básica de procesamiento textual/visual en modelos de lenguaje.

---

## 2. Descripción General

### 2.1 Perspectiva del Producto

LM Desk actúa como una capa intermedia ligera ("Context-First") entre el repositorio de código local del desarrollador y las APIs de inferencia de IA. No requiere bases de datos externas; opera directamente sobre el sistema de archivos de la máquina local (configurado mediante `TARGET_PROJECT_PATH`) y persiste el historial y las plantillas en formato JSON y Markdown dentro de `STORAGE_PATH`.

### 2.2 Funciones del Producto

El sistema se estructura en seis módulos principales:

1. **Explorador de Archivos Virtualizado y Grafo de Dependencias:** Renderiza miles de nodos a 60fps con `@tanstack/react-virtual` y analiza declaraciones de importación para incorporar dependencias asociadas.
2. **Editor Lexical Multimodal con Menciones (@):** Editor WYSIWYG que intercepta `@` para vincular archivos dinámicamente y soporta la incorporación de imágenes externas o locales.
3. **Generador y Revisor de Prompts:** Ensambla las instrucciones del sistema, archivos formateados en XML y la consulta del usuario, estimando caracteres y tokens en tiempo real.
4. **Motor de Inferencia Multi-Proveedor:** Capa de abstracción compatible con OpenAI, Google Vertex AI, Google GenAI, NVIDIA NIM, OpenRouter y proxies compatibles (Antigravity) usando Vercel AI SDK.
5. **Espacio de Chat Interactivo Multi-Turno:** Renderiza respuestas mediante Streamdown, soporta preguntas de seguimiento, edición/eliminación de turnos anteriores y control del historial de razonamiento.
6. **Gestor de Historial y Plantillas de Sistema:** Persistencia y edición inline de títulos de conversaciones, así como CRUD completo de plantillas de instrucciones en archivos `.md`.

### 2.3 Entorno de Ejecución

- **Servidor / Backend:** Node.js (v20.0.0 o superior), Next.js 16 App Router (React 19).
- **Cliente / Frontend:** Navegadores web modernos (Chrome, Firefox, Safari, Edge) con soporte de React 19 y Tailwind CSS v4.
- **Almacenamiento Local:** Directorios configurables en el sistema de archivos local (`STORAGE_PATH` y `TARGET_PROJECT_PATH`).

### 2.4 Restricciones de Diseño e Implementación

- **Prevención de Path Traversal:** Toda lectura de código o imágenes locales debe validarse estrictamente contra la raíz `TARGET_PROJECT_PATH`.
- **Límite de Concurrencia de Lectura:** El servidor limita a un máximo de 20 lecturas simultáneas de archivos (`fs/promises`) para evitar agotar descriptores de archivos del SO.
- **Estado de Interfaz en Cliente:** Uso de Zustand 5 (sin inconsistencias de hidratación en SSR) para el almacenamiento de preferencias en `localStorage`.
- **Extensiones Permitidas:** Procesamiento restringido a archivos de código/texto plano (`.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.json`, `.css`, `.md`, etc.) e imágenes estándar (`.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`).

---

## 3. Requisitos del Sistema

### 3.1 Interfaces de Usuario

- Interfaz responsiva con soporte nativo de modo oscuro (clase `.dark` gestionada por Tailwind CSS v4).
- Barra lateral (Sidebar) colapsable para la navegación e interactividad del historial de análisis.
- Ventana modal interactiva (Dialog) para la exploración virtualizada y selección masiva del árbol de archivos.
- Panel desplegable lateral (Settings Drawer) para la configuración en caliente de proveedores, parámetros de IA y plantillas del sistema.

### 3.2 Interfaces de Software

- **Node.js `fs/promises` & `path`:** Operaciones de lectura segura del proyecto objetivo y almacenamiento local JSON/Markdown.
- **Vercel AI SDK 7+ (`ai`, `@ai-sdk/react`):** Utilización de `streamText`, `createUIMessageStreamResponse`, `convertToModelMessages` y hook `useChat` con payloads `files`.
- **Zod 4+:** Validación de esquemas en peticiones de API y formateo de errores con `z.prettifyError()`.
- **Streamdown:** Renderizado de contenido Markdown transmitido en streaming con resaltado sintáctico de código mediante `@streamdown/code`.

---

## 4. Requisitos Funcionales

### 4.1 Módulo de Selección de Contexto (File Explorer & Grafos)

- **RF-1.1:** El sistema debe listar recursivamente los archivos del proyecto raíz configurado en `TARGET_PROJECT_PATH`.
- **RF-1.2:** El árbol debe ignorar automáticamente directorios de dependencias y compilación (`node_modules`, `.git`, `.next`, `dist`, `build`, etc.).
- **RF-1.3:** Permitir la selección de carpetas completas, marcando de forma automática sus archivos hijos.
- **RF-1.4:** Si se selecciona una fracción de archivos de una carpeta, el nodo padre debe reflejar un estado indeterminado (check parcial).
- **RF-1.5:** Permitir recargar la estructura de archivos en caliente desde el servidor mediante Server Actions sin reiniciar la selección.
- **RF-1.6:** Permitir remover archivos individuales o limpiar la selección completa previa confirmación en diálogo modal.
- **RF-1.7 (Resolución de Dependencias):** El sistema debe ofrecer un control opcional ("Incluir dependencias") para analizar expresiones `import` en el código seleccionado y agregar automáticamente los archivos importados al grafo de contexto.

### 4.2 Módulo de Edición de Consulta y Adjuntos (Rich Editor & Multimodal)

- **RF-2.1:** Permitir la redacción libre de la consulta principal del usuario mediante el editor Lexical.
- **RF-2.2:** Al escribir el carácter `@`, el editor debe desplegar una lista emergente con los archivos del proyecto para autocompletar.
- **RF-2.3:** Al elegir un archivo del menú de menciones, este se inserta como un nodo especial ("Token Node") no editable de color diferenciado.
- **RF-2.4:** Insertar una mención de archivo debe agregar automáticamente dicha ruta a la lista de archivos seleccionados en el explorador.
- **RF-2.5 (Adjuntos Multimodales):** El usuario debe poder ingresar URLs de imágenes externas o seleccionar archivos de imagen locales (`.png`, `.jpg`, `.webp`), los cuales se codificarán en Base64 e incluirán en el payload del LLM.

### 4.3 Módulo de Generación y Revisor de Prompts

- **RF-3.1:** El sistema debe compilar un prompt unificado estructurado en:
  - Instrucciones del sistema (System Prompt).
  - Archivos de código encapsulados en `<file path="...">...</file>`.
  - La tarea/consulta definida por el usuario.
- **RF-3.2:** Mostrar una vista previa completa del prompt compilado en un área de lectura con scroll.
- **RF-3.3:** Disponer de una acción de un solo clic para copiar el prompt completo al portapapeles.
- **RF-3.4:** Calcular y mostrar en tiempo real la cantidad total de caracteres y una estimación del conteo de tokens (`~caracteres / 4`).

### 4.4 Módulo de Inferencia y Chat Interactivo Multi-Turno

- **RF-4.1:** Enviar la consulta y el contexto directo al proveedor de IA configurado mediante flujos de streaming HTTP.
- **RF-4.2:** Transmitir y renderizar en tiempo real la respuesta en formato Markdown enriquecido.
- **RF-4.3 (Thinking Blocks):** Si el modelo genera bloques de razonamiento (cadena de pensamiento), estos deben renderizarse dentro de un componente `Reasoning` colapsable diferenciado del texto de respuesta.
- **RF-4.4 (Preguntas de Seguimiento):** El espacio de chat debe permitir enviar preguntas adicionales manteniendo el hilo de la conversación activo.
- **RF-4.5 (Control de Razonamiento en Seguimiento):** El usuario puede activar o desactivar la casilla de inclusión del razonamiento previo como contexto para las preguntas de seguimiento.
- **RF-4.6 (Edición y Eliminación de Turnos):** Permitir al usuario editar el texto de consultas pasadas o la respuesta generada por la IA, así como eliminar un turno completo de la conversación.
- **RF-4.7:** Permitir cancelar/detener la generación de la respuesta en cualquier punto durante el streaming.

### 4.5 Módulo de Historial y Persistencia

- **RF-5.1:** Al finalizar la generación de una respuesta, guardar de forma automática un archivo JSON en `STORAGE_PATH/chats` con el ID, título generado/asignado, fecha de creación, rutas seleccionadas y la lista de mensajes UI.
- **RF-5.2:** Listar en el Sidebar los análisis guardados ordenados descendentemente por fecha.
- **RF-5.3 (Edición de Título Inline):** Permitir renombrar el título de cualquier chat del historial directamente desde la barra lateral.
- **RF-5.4:** Permitir la eliminación de análisis del historial previa confirmación del usuario.

### 4.6 Módulo de Configuración de Parámetros y Plantillas

- **RF-6.1:** Selector dinámico de proveedor de inferencia (OpenAI, Google Vertex AI, Google GenAI, NVIDIA NIM, OpenRouter, Antigravity) y sus modelos compatibles.
- **RF-6.2:** Controles deslizantes (Sliders) para calibrar la Temperatura (rango 0.00 a 2.00) y Top P (rango 0.00 a 1.00).
- **RF-6.3 (Gestor de Plantillas Markdown):** Interfaz para crear, cargar, guardar y eliminar plantillas de instrucciones de sistema almacenadas como archivos `.md` en `STORAGE_PATH/prompts`.

---

## 5. Requisitos No Funcionales

### 5.1 Rendimiento

- **Scroll Virtualizado a 60fps:** La lista de archivos del explorador y la vista de seleccionados debe mantener un renderizado fluido utilizando `@tanstack/react-virtual`, soportando proyectos de más de 5,000 archivos sin degradación visual.
- **Control de Concurrencia de Archivos:** Las operaciones del servidor deben ejecutarse en lotes controlados (límite de 20 lecturas simultáneas) para prevenir el agotamiento de recursos del sistema operativo.

### 5.2 Seguridad

- **Aislamiento de Rutas (Sandbox):** La función `validateAndSanitizePath` debe verificar estrictamente que cualquier archivo (código o imagen local) pertenezca al directorio `TARGET_PROJECT_PATH`. Solicitudes fuera de dicho alcance deben ser denegadas.
- **Sanitización de Archivos de Plantilla:** Los nombres de plantillas creados por los usuarios se desinfectan eliminando caracteres especiales para impedir ataques de Inyección en el Sistema de Archivos.

### 5.3 Mantenibilidad y Extensibilidad

- **Arquitectura de Proveedores (Factory Pattern):** El módulo de inferencia debe abstraer la instanciación de clientes de IA mediante la interfaz `InferenceClient`, facilitando la inclusión de nuevos proveedores sin alterar la capa de API.
- **Tipado Estricto:** Uso del 100% de TypeScript bajo configuración estricta, integrando validación de esquemas Zod en todas las entradas de servidor y payloads de acciones.

---

## 6. Funcionalidades Futuras (Hoja de Ruta)

- **Ingesta de Documentos Multiformato:** Lectura y extracción directa de texto en archivos PDF, DOCX y XLSX para vincular especificaciones funcionales junto al código fuente.
- **Web Scraper de Documentación:** Extracción de sitios web de APIs públicas para incorporar bloques de documentación técnica externa.
- **Agentes de Pre-estructuración Acotada:** Integración de agentes especializados de paso único para resumir arquitecturas o mapear archivos relevantes ante consultas complejas.
- **Búsqueda Fundamentada (Google Search Grounding):** Integración con APIs de búsqueda web para validar o actualizar parches de librerías en tiempo real.

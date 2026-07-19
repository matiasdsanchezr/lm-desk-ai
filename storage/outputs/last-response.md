### Explicación Técnica

Para documentar formalmente el sistema **LM Desk**, se ha diseñado una **Especificación de Requisitos de Software (SRS)** estructurada bajo el estándar IEEE 830, adaptada a metodologías ágiles y arquitecturas modernas de IA. 

El documento detalla:
1. **Objetivo y Alcance:** Contextualización del sistema como optimizador de contexto de código para LLMs.
2. **Descripción General:** Arquitectura desacoplada basada en Next.js App Router, sistema de archivos local, estado persistente con Zustand y motor de inferencia multi-proveedor.
3. **Requisitos Funcionales y Casos de Uso:** Desglose del explorador virtualizado, editor enriquecido Lexical con menciones, previsualizador de prompts, streaming con bloques de razonamiento (thinking) e historial persistente.
4. **Requisitos No Funcionales:** Seguridad del File System (prevención de Path Traversal), rendimiento de renderizado (virtualización de listas) y límites de concurrencia.

---

### Estructura de Archivos

Se propone guardar este documento en la raíz del proyecto o dentro de una carpeta de documentación técnica:

```text
docs/
└── srs.md
```

---

### Bloque de Código

docs/srs.md
```markdown
# Software Requirements Specification (SRS)
## Proyecto: LM Desk (Contexto Inteligente para LLMs)

---

## 1. Introducción

### 1.1 Propósito
Este documento define los requisitos funcionales, no funcionales y de sistema para la aplicación **LM Desk**, una herramienta de escritorio y web diseñada para optimizar la preparación de contexto de código fuente y la interacción con Modelos de Lenguaje Grande (LLMs).

### 1.2 Alcance del Producto
LM Desk permite a desarrolladores de software:
* Explorar de forma interactiva el árbol de archivos de un proyecto local objetivo.
* Seleccionar selectivamente archivos de código relevantes para conformar el contexto de una consulta.
* Redactar instrucciones usando un editor de texto enriquecido con autocompletado y vinculación automática mediante menciones (`@nombre_archivo`).
* Compilar prompts estructurados en formatos limpios (XML/Markdown) optimizados para arquitecturas de razonamiento profundo (ej. Claude 3.5 Sonnet, DeepSeek R1, Gemini 2.5 Pro).
* Ejecutar inferencias en tiempo real (streaming) con soporte de visualización de razonamiento ("thinking blocks") a través de múltiples proveedores de IA.
* Gestionar un historial local de análisis y plantillas personalizadas de instrucciones del sistema.

### 1.3 Glosario
* **LLM (Large Language Model):** Modelo de inteligencia artificial especializado en procesamiento y generación de lenguaje natural y código.
* **Prompt:** Instrucción estructurada provista a un LLM para guiar su respuesta.
* **RSC (React Server Components):** Componentes de React que se ejecutan exclusivamente en el servidor dentro del framework Next.js.
* **System Prompt (Instrucción del Sistema):** Directrices de comportamiento globales aplicadas al modelo de IA antes de procesar la consulta del usuario.
* **Token:** Unidad básica de procesamiento de texto en modelos de lenguaje.

---

## 2. Descripción General

### 2.1 Perspectiva del Producto
LM Desk funciona como un entorno intermedio entre el código fuente local del desarrollador y las APIs de inferencia de IA. No requiere base de datos externa; utiliza el sistema de archivos del servidor/máquina local configurado a través de variables de entorno para leer el código del proyecto y almacenar el historial en formato JSON.

### 2.2 Funciones del Producto
El sistema se divide en cuatro módulos principales:
1. **Explorador de Archivos Virtualizado:** Renderiza de manera eficiente miles de archivos mediante técnicas de virtualización, permitiendo la selección jerárquica (carpetas y archivos individuales).
2. **Editor Lexical con Menciones:** Editor WYSIWYG que intercepta el carácter `@` para sugerir archivos del árbol e incluirlos dinámicamente en la selección de contexto.
3. **Generador y Revisor de Prompts:** Unificador de plantillas que procesa las variables de instrucciones del sistema, el código fuente formateado y la consulta del usuario.
4. **Motor de Inferencia Multi-Proveedor:** Capa de abstracción compatible con Vertex AI, Google GenAI, NVIDIA NIM, OpenAI, OpenRouter y proxies compatibles con OpenAI (Antigravity).

### 2.3 Entorno de Ejecución
* **Servidor/Backend:** Node.js (v18 o superior), Next.js 15/16 App Router.
* **Cliente/Frontend:** Navegadores modernos con soporte para APIs Web estándar (Chrome, Firefox, Safari, Edge).
* **Almacenamiento:** Directorio local configurable en el sistema de archivos (`STORAGE_PATH`).

### 2.4 Restricciones de Diseño e Implementación
* **Seguridad de Archivos:** La lectura de archivos debe limitarse estrictamente al directorio raíz configurado (`TARGET_PROJECT_PATH`) para evitar vulnerabilidades de Path Traversal.
* **Sin Estado Global Pesado:** El estado de la interfaz se maneja en el cliente mediante Zustand persistido en `localStorage` para evitar la sobrecarga de sesiones de servidor.
* **Extensiones Permitidas:** Solo se permite procesar archivos de texto plano con extensiones de código predefinidas (ej. `.ts`, `.tsx`, `.js`, `.py`, `.json`, `.css`, `.md`).

---

## 3. Requisitos del Sistema

### 3.1 Interfaces Externas

#### Interfaz de Usuario
* Interfaz responsiva con soporte nativo de modo oscuro (clase `.dark` controlada por Tailwind).
* Sidebar colapsable para la gestión del historial de chats.
* Panel dividido (Split Panel) en pantallas de escritorio para visualización simultánea del árbol de archivos y los detalles de selección.
* Cajón de configuración (Drawer) lateral derecho para ajustes rápidos de parámetros de IA.

#### Interfaces de Software
* **API del Sistema de Archivos (Node.js `fs/promises`):** Lectura del código fuente y persistencia de chats/prompts en formato JSON.
* **Vercel AI SDK:** Integración para la normalización de llamadas de texto y flujos de streaming (`streamText`).

---

## 4. Requisitos Funcionales

### 4.1 Módulo de Selección de Contexto (File Explorer)
* **RF-1.1:** El sistema debe listar de forma recursiva los archivos del directorio raíz configurado en `TARGET_PROJECT_PATH`.
* **RF-1.2:** El árbol de archivos debe ignorar carpetas de dependencias y compilación predefinidas (`node_modules`, `.git`, `.next`, `dist`, etc.).
* **RF-1.3:** El sistema debe permitir la selección de carpetas completas, marcando de forma automática todos sus archivos hijos en estado seleccionado.
* **RF-1.4:** Si se seleccionan algunos archivos de una carpeta (pero no todos), la carpeta padre debe mostrar un estado visual indeterminado (check parcial).
* **RF-1.5:** El explorador debe soportar la recarga en caliente de archivos desde el servidor mediante Server Actions sin perder el estado de selección actual.
* **RF-1.6:** El panel de seleccionados debe permitir remover archivos de la selección de forma individual o vaciar la lista completa mediante un diálogo de confirmación.

### 4.2 Módulo de Edición de Consulta (Rich Editor)
* **RF-2.1:** El editor de texto debe permitir la redacción libre de la consulta del usuario.
* **RF-2.2:** Al ingresar el carácter `@`, el sistema debe desplegar un menú flotante con la lista de archivos disponibles en el proyecto.
* **RF-2.3:** Al seleccionar un archivo del menú de menciones, este se debe insertar en el editor como un nodo especial ("Token Node") no editable de color diferenciado.
* **RF-2.4:** La inserción de una mención de archivo debe agregar automáticamente dicho archivo a la lista de archivos seleccionados en el explorador.
* **RF-2.5:** El editor debe soportar la sincronización bidireccional: si un archivo mencionado es deseleccionado del explorador, el editor debe conservar el texto pero desvincular el estado del nodo.

### 4.3 Módulo de Generación y Previsualización de Prompts
* **RF-3.1:** El sistema debe compilar un prompt estructurado concatenando:
  * Instrucciones del sistema (System Prompt).
  * Archivos seleccionados encapsulados en etiquetas `<file path="...">...</file>`.
  * La consulta final del usuario.
* **RF-3.2:** El usuario debe poder previsualizar el prompt final generado en un área de texto de solo lectura con scroll dedicado.
* **RF-3.3:** El sistema debe proveer una acción de un solo clic para copiar el prompt completo al portapapeles.
* **RF-3.4:** El sistema debe estimar y mostrar en tiempo real la cantidad de caracteres y una aproximación de tokens del prompt generado.

### 4.4 Módulo de Inferencia y Chat Interactivo
* **RF-4.1:** El sistema debe permitir enviar el prompt generado directamente a la API de inferencia seleccionada.
* **RF-4.2:** La respuesta del asistente debe renderizarse en tiempo real (streaming) utilizando el formato Markdown.
* **RF-4.3:** Si el modelo admite razonamiento (ej. modelos tipo DeepSeek R1 o Gemini con thinking habilitado), el flujo de razonamiento ("thinking") debe mostrarse dentro de un componente colapsable diferenciado del texto de respuesta final.
* **RF-4.4:** El componente de razonamiento debe cerrarse automáticamente tras finalizar el streaming del texto principal, a menos que el usuario lo abra manualmente.
* **RF-4.5:** El sistema debe permitir al usuario cancelar/detener la generación de la respuesta en cualquier momento del streaming.

### 4.5 Módulo de Historial y Persistencia
* **RF-5.1:** Al finalizar la generación de una respuesta, el sistema debe guardar automáticamente un archivo JSON en `STORAGE_PATH/chats` que contenga el ID, título autogenerado, fecha de creación, archivos seleccionados, prompt de usuario y respuesta de la IA.
* **RF-5.2:** El sidebar de historial debe listar los chats guardados ordenados cronológicamente de forma descendente.
* **RF-5.3:** Al hacer clic en un chat del historial, el sistema debe cargar el estado correspondiente en la interfaz (prompt y respuesta generada).
* **RF-5.4:** El usuario debe poder eliminar elementos del historial a través de un botón dedicado, previa confirmación mediante un cuadro de diálogo.

### 4.6 Módulo de Configuración de Parámetros (Settings)
* **RF-6.1:** El sistema debe permitir cambiar el proveedor de IA y el modelo asociado de forma dinámica a través de un menú selector.
* **RF-6.2:** El usuario debe poder ajustar los parámetros de Temperatura (rango 0.00 a 2.00) y Top P (rango 0.00 a 1.00) mediante controles deslizantes (Sliders).
* **RF-6.3:** El sistema debe permitir la creación, edición y eliminación de plantillas personalizadas de prompts de sistema en archivos `.md` locales en `STORAGE_PATH/prompts`.

---

## 5. Requisitos No Funcionales

### 5.1 Rendimiento
* **Rendimiento de Renderizado:** El explorador de archivos debe soportar la visualización de estructuras de más de 5,000 archivos sin degradación del rendimiento de la interfaz de usuario, garantizando un scroll fluido a 60fps mediante virtualización de listas.
* **Concurrencia en Servidor:** El procesamiento de lectura de archivos locales debe realizarse con un límite de concurrencia controlado (máximo de 20 lecturas simultáneas) para evitar el agotamiento de descriptores de archivos en el sistema operativo.

### 5.2 Seguridad
* **Restricción de Directorios:** El backend debe validar que cualquier ruta de archivo solicitada para lectura esté contenida dentro del árbol de `TARGET_PROJECT_PATH`. Cualquier ruta que resuelva fuera de este límite debe ser rechazada con un error de seguridad inmediato.
* **Sanitización de Nombres de Plantillas:** Los nombres de archivos de plantillas creados por el usuario deben ser sanitizados eliminando caracteres especiales para prevenir ataques de inyección en el sistema de archivos.

### 5.3 Mantenibilidad y Extensibilidad
* **Arquitectura de Proveedores:** La capa de inferencia debe utilizar un patrón Factory que permita añadir nuevos proveedores de API (ej. Anthropic nativo, Cohere) implementando la interfaz común `InferenceClient`.
* **Tipado Estricto:** El 100% del código fuente debe estar escrito en TypeScript bajo configuraciones estrictas, garantizando la seguridad de tipos en los payloads de las peticiones.
```
# Memoria de Desarrollo: LM Desk

**Proyecto:** LM Desk (Contexto Inteligente y Entorno de Inferencia para LLMs)  
**Versión:** 0.1.0  
**Fecha:** Julio 2026  
**Estado:** Producción Local / Código Abierto

---

## 1. Introducción y Resumen Ejecutivo

**LM Desk** es un entorno de trabajo de escritorio y web diseñado para optimizar la interacción entre desarrolladores y Modelos de Lenguaje de Gran Escala (LLMs). La herramienta permite explorar repositorios de código locales, seleccionar contextos mediante un árbol interactivo o sistema de menciones `@`, estructurar prompts limpios en formatos legibles por IA (XML/Markdown) y ejecutar inferencias directa o externamente sin sobrecostos operativos.

El proyecto nació para resolver una brecha clara en el flujo de trabajo diario de la ingeniería de software: **la falta de un término medio entre la tediosa manipulación manual de archivos y la sobre-automatización costosa e ineficiente de los agentes CLI actuales.**

---

## 2. El Problema

En el ecosistema actual de desarrollo asistido por IA, los desarrolladores se enfrentan a dos extremos ineficientes para consultas puntuales de código:

### 2.1. El dilema de la preparación manual

Cuando un desarrollador desea realizar una consulta sencilla en modelos web (ChatGPT, DeepSeek R1, Claude Web), debe navegar entre directorios, copiar y pegar bloques de código o subir archivos de forma manual. Este proceso presenta serios inconvenientes:

- **Pérdida de tiempo y contexto:** Seleccionar código manualmente destruye la estructura jerárquica y de dependencias del proyecto.
- **Fricción al iterar:** Al reiniciar la conversación o cambiar de modelo, el usuario se ve obligado a repetir todo el proceso de carga de archivos desde cero.

### 2.2. La trampa del "Overhead" en Herramientas de Agentes CLI

Herramientas CLI automatizadas (como Codex CLI, Antigravity CLI o Claude Code) han emergido como soluciones integrales. Sin embargo, para consultas puntuales o refactorizaciones específicas, introducen ineficiencias severas:

- **Consumo desmedido de tokens:** Estas herramientas inyectan prompts de sistema masivos, descripciones de herramientas (_tools/skills_) y árboles completos del sistema para resolver tareas triviales.
- **Bucle de ejecución innecesario (_Multi-step Agents_):** Un requerimiento simple puede desencadenar decenas de llamadas intermedias a la API (lectura de directorio, búsqueda léxica, ejecución de pruebas), elevando drásticamente el costo sin garantizar la respuesta correcta.
- **Pérdida de control del usuario:** El desarrollador pierde visibilidad sobre qué partes del código fueron realmente analizadas y procesadas por el modelo.

---

## 3. La Solución: LM Desk

**LM Desk** propone un enfoque **"Context-First, Agent-Optional"**. Permite armar un contexto preciso, enriquecido y determinista de forma rápida, dando al desarrollador el control absoluto sobre qué se envía al LLM y cómo se gasta su cuota de tokens.

|Módulo|Función Principal|Ejemplo / Salida|
|-|-|-|
|**1. Explorador Virtualizado**|Selección jerárquica de archivos del proyecto local.|Marcado interactivo (`[x] Button.ts`)|
|**2. Editor Lexical**|Redacción de tarea y resolución de dependencias.|`"Refactorizar @Button.ts..."`|
|**3. Salida Dual**|Exportación estructurada o inferencia local directa.|a) Copiar XML/Prompt<br>b) Inferencia directa|

### Principios Clave:

1. **Empaquetado Estructurado:** Generación automática de bloques `<file path="...">` que los modelos de razonamiento profundo (DeepSeek R1, Claude 3.5 Sonnet) interpretan de forma óptima.
2. **Cero Fricción al Iterar:** Mantiene el estado localmente. Si la respuesta no es satisfactoria, se ajusta la consulta o el contexto sin perder la configuración de archivos seleccionados.
3. **Control Total de Costos:** Se elimina todo el consumo incidental de tokens derivado de llamadas a herramientas (_function calling_) no solicitadas.

---

## 4. Decisiones Principales de Arquitectura y Tecnología

### 4.1. Frontend y Experiencia de Usuario (DX)

- **Next.js 16 (App Router) + React 19:** Permite combinar renderizado de servidor de alto rendimiento (RSC) para la lectura inicial del árbol con una interfaz fluida e interactiva en el cliente.
- **Virtualización con `@tanstack/react-virtual`:** Capacidad para renderizar árboles de proyecto de más de 5,000 archivos sin degradar el framerate de la aplicación (scroll constante a 60fps).
- **Editor WYSIWYG basado en Lexical:** Implementación del menú flotante de menciones (`@`). Al escribir `@`, el editor intercepta la entrada, despliega el árbol y vincula automáticamente el archivo al contexto global de la consulta.

### 4.2. Lectura Segura y Grafo de Dependencias Local

- **Sin Base de Datos Externa:** Todo el estado del sistema, chats e instrucciones se persisten en formato JSON dentro de un directorio local (`STORAGE_PATH`), garantizando máxima velocidad y privacidad.
- **Seguridad de Archivos (_Path Traversal Prevention_):** Lectura acotada estrictamente a `TARGET_PROJECT_PATH` para evitar fugas de información del sistema operativo.
- **Control de Concurrencia:** Límite máximo de 20 lecturas simultáneas de archivos mediante `fs/promises` para prevenir la saturación de descriptores de archivos (_File Descriptors_) en Node.js.
- **Resolución de Importaciones:** Extracción automática de dependencias directas (`import ... from '...'`) para incluir los módulos requeridos sin intervención manual.

### 4.3. Motor de Inferencia Multi-Proveedor (_Factory Pattern_)

El backend cuenta con una capa de abstracción basada en el patrón _Factory_ integrada con **Vercel AI SDK**, permitiendo intercalar proveedores sin modificar la interfaz:

- **Proveedores soportados:** OpenAI, Google Vertex AI, Google GenAI, NVIDIA NIM, OpenRouter y proxies compatibles como Antigravity.
- **Soporte de Razonamiento ("Thinking Blocks"):** Renderizado separado en tiempo real para modelos que transmiten cadenas de pensamiento (ej. DeepSeek R1), colapsables dinámicamente para no ensuciar la lectura.

---

## 5. Comparativa de Eficiencia

|Métrica / Aspecto|Copiar-Pegar Manual|Agentes CLI (Claude Code / Antigravity)|**LM Desk**|
|-|-|-|-|
|**Tiempo de preparación de contexto**|Alto (2-5 min)|Bajo (Automático)|**Muy Bajo (Segundos)**|
|**Overhead de Tokens**|Nulo|Muy Alto (Prompts de sistema + Tools)|**Nulo (Solo contexto + prompt)**|
|**Control sobre archivos enviados**|Alto (pero tedioso)|Bajo (decidido por el agente)|**Total (Explorador + @)**|
|**Costo por consulta simple**|Bajo (tiempo humano alto)|Alto (múltiples iteraciones)|**Mínimo y Optimizado**|
|**Reutilización de estado de chat**|Nula|Compleja|**Instantánea (Persistencia JSON)**|

---

## 6. Hoja de Ruta y Mejoras Futuras

Para evolucionar LM Desk de un entorno de consulta de código a una plataforma integral de contexto para LLMs, se contemplan las siguientes integraciones en próximas versiones:

### 6.1. Ingesta de Documentos Multiformato (Sin Agentes)

- Soporte nativo para lectura y extracción de texto en documentos **PDF, DOCX, XLSX y Markdown extendido**.
- Permite cruzar especificaciones de diseño o requerimientos de negocio directamente con el código fuente en una sola consulta.

### 6.2. Web Scraper para Ingestión de Documentación

- Módulo de extracción para convertir sitios web de documentación técnica o APIs públicas en bloques de contexto estructurados en Markdown.
- Habilidad para referenciar documentación externa mediante menciones (ej. `@docs:nextjs-routing`).

### 6.3. Agentes Especializados de Estructuración Previa

- Implementación de **agentes de propósito único y acotado**. En lugar de agentes de ejecución libre con bucles infinitos, se integrarán agentes dedicados exclusivamente a:
  - Resumir o mapear la arquitectura a partir de un árbol de directorios masivo.
  - Sintetizar diagramas de arquitectura presentes en imágenes o esquemas.
  - Filtrar automáticamente cuáles archivos son relevantes dada una consulta compleja en lenguaje natural.

### 6.4. Fundamentación con Búsqueda de Google (_Search Grounding_)

- Integración con la API de _Google Search Grounding_ en proveedores Vertex/GenAI para complementar el código fuente local con información o parches actualizados de librerías en tiempo real.

---

## 7. Uso de IA como Asistente de Desarrollo

El diseño, arquitectura e implementación de **LM Desk** incorporó la Inteligencia Artificial no solo como el dominio funcional principal del software, sino como un **asistente transversal durante todo el Ciclo de Vida del Desarrollo de Software (SDLC)**. Se aplicó un enfoque de aceleración asistida para la ideación, planificación de requisitos, estructuración de código, resolución de incompatibilidades de versiones y posterior evolución iterativa mediante la técnica de _dogfooding_ (utilizar la propia herramienta para autoconstruirse).

|Etapa SDLC|Herramienta|Enfoque / Actividades Clave|
|-|-|-|
|**1. Planificación y Especificación**|Open Code|Redacción del SRS (`docs/srs.md`) y arquitectura base.|
|**2. Desarrollo Inicial**|Gemini CLI / Antigravity|Integración UI, SKILLs y Vercel AI SDK.|
|**3. Investigación Puntual**|Perplexity|Resolución de APIs, consultas técnicas y depuración.|
|**4. Evolución e Iteración**|LM Desk (_Dogfooding_)|Refactorización y mejora continua autoconstruida.|

### 7.1. Planificación, Alcance y Especificación de Requisitos (Open Code)

En la fase conceptual se utilizó **Open Code** como motor de razonamiento para transformar la problemática de costos e ineficiencia de los agentes CLI en un alcance técnico viable.

- **Modelado de Requisitos:** Se redactó la Especificación de Requisitos de Software (`docs/srs.md`), definiendo rigurosamente los Requisitos Funcionales (RF) y No Funcionales (RNF).
- **Definición de Arquitectura:** Asistió en la elección de límites de seguridad (prevención de _Path Traversal_ en el sistema de archivos), las restricciones de concurrencia en lectura de archivos locales y el diseño de estado ligero mediante Zustand.

### 7.2. Desarrollo Inicial y Manejo de Librerías Dinámicas (Gemini CLI & Antigravity IDE)

Durante las primeras fases de codificación, se emplearon **Antigravity CLI** y el entorno **Antigravity IDE** para generar las estructuras base de componentes y servicios del backend.

- **Uso de SKILLs para APIs en evolución:** Dado que librerías clave como el Vercel AI SDK (`ai`, `@ai-sdk/react`), Next.js 16 App Router o Tailwind CSS v4 sufren cambios constantes en sus sintaxis, se configuraron _SKILLs_ (archivos de contexto extendido con la documentación actualizada de dichas librerías). Esto evitó alucinaciones sobre métodos obsoletos y garantizó código actualizado con React 19 y TypeScript estricto.
- **Maquetado e Integración UI:** Generación asistida de los wrappers de ShadCN UI, la implementación del árbol virtualizado con `@tanstack/react-virtual` y la configuración de controladores del editor de texto Lexical.

### 7.3. Investigación Técnica y Depuración Aislando Contexto (Perplexity)

Para dudas técnicas puntuales, se recurrió a **Perplexity** como motor de investigación asistida:

- **Validación de APIs Externas:** Consultas sobre especificidades de modelos en NVIDIA NIM, contratos de API en Google Vertex AI y firmas de esquemas Zod para la sanitización de payloads HTTP.
- **Resolución de Errores Complejos:** Diagnóstico de problemas de hidratación en Server Components de Next.js, comportamiento de scroll en listas virtualizadas y límites de memoria durante la lectura masiva de archivos planos.

### 7.4. Evolución Incremental mediante Dogfooding

Una vez que se alcanzó una primera versión funcional (MVP) de la interfaz de chat y la selección de archivos, **el desarrollo posterior de la aplicación se realizó utilizando la propia herramienta LM Desk**.

- **Iteración Asistida Local:** Se utilizó LM Desk para seleccionar componentes del proyecto (ej. `context-builder.tsx`, `chat-history-service.ts`), generar prompts estructurados en XML y procesarlos mediante proveedores de IA como **NVIDIA NIM**, **OpenRouter** y **Google Gemini**.
- **Nuevas Funcionalidades Autogeneradas:** A través de este flujo se refactorizaron componentes clave, como la persistencia de historial, la creación del panel de configuración de parámetros y la vinculación de menciones `@` con el explorador.

Este enfoque demostró la premisa inicial del proyecto: la capacidad de iterar sobre un código fuente local de forma rápida, precisa y con control total de costos.

---

## 8. Conclusión

**LM Desk** demuestra que la automatización asistida por IA no siempre requiere la delegación ciega del flujo de trabajo a agentes autónomos costosos. Ofrecer las herramientas adecuadas para que el desarrollador compile, inspeccione y envíe contexto determinista es la manera más eficiente, económica y precisa de resolver consultas técnicas diarias.

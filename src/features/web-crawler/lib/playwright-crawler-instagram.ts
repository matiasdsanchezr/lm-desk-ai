import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
  type Response as PlaywrightResponse,
} from "playwright"
import type { CrawledPageNode } from "../types"

/* ============================================================================
 * scrapeUrlsWithPlaywright — versión con soporte especializado para Instagram
 * ============================================================================
 *
 * ANÁLISIS DE LA ESTRUCTURA DE UNA PÁGINA DE POST DE INSTAGRAM (verificado
 * sobre el HTML real adjuntado por el usuario, formato "Comet/Relay" 2025-2026):
 *
 * 1) LAS CLASES CSS ESTÁN HASHEADAS Y CAMBIAN CON CADA BUILD
 *    Ej: class="x1ejq31n x18oe1m7 x1sy0etr xstzfhl..." — NO se puede depender
 *    de ids/clases para localizar comentarios o el caption.
 *
 * 2) EL DATO REAL VIVE EN PAYLOADS JSON EMBEBIDOS EN EL HTML
 *    Instagram (SSR/hidratación de React) incrusta ~40+ bloques
 *    `<script type="application/json" data-sjs>` con el estado inicial de
 *    Relay ("ScheduledServerJS.handle"). Dentro de uno de ellos está el post:
 *
 *    data.xig_polaris_media = {
 *      pk, code (shortcode), __typename,
 *      if_not_gated_logged_out: {                       <-- el objeto MEDIA
 *        pk, code, taken_at (unix seg), media_type (1=img,2=video,8=carrusel),
 *        product_type ("feed" | "clips" | "igtv"), like_count, comment_count,
 *        caption: { pk, created_at, text, has_translation },
 *        user: { pk, id, username, full_name, is_verified, is_private, ... },
 *        display_uri, image_versions2, accessibility_caption,
 *        usertags, location, caption_is_edited, ...
 *      },
 *      comments_connection: {                            <-- COMENTARIOS
 *        edges: [{ cursor, node: {
 *          pk, id, text, created_at, comment_like_count,
 *          child_comment_count, parent_comment_id,
 *          user: { pk, id, username, full_name, is_verified },
 *          __typename: "XIGComment"
 *        }}],
 *        page_info: { end_cursor, has_next_page }
 *      }
 *    }
 *
 *    El mismo objeto `user` trae `polaris_ordered_timeline_connection.edges[]`
 *    con ~12 posts recientes del mismo autor (caption + code + display_uri).
 *
 *    En formatos anteriores/alternativos (reels, vistas logueadas) el mismo
 *    dato aparece bajo claves distintas:
 *      - xdt_api__v1__media__shortcode__web_info.items[] (caption, preview_comments)
 *      - shortcode / taken_at_timestamp / edge_media_to_caption.edges[].node.text
 *      - edge_media_to_comment.edges[].node { text, user|owner, created_at }
 *
 * 3) COMENTARIOS ADICIONALES ("Load more comments") LLEGAN POR XHR A /api/graphql/
 *    Se capturan con page.on("response") y se parsean con el mismo colector.
 *
 * ESTRATEGIA (a prueba de cambios de esquema): NO depender de rutas JSON fijas
 * ni de clases CSS. Se recorren TODOS los payloads JSON de forma recursiva y se
 * clasifican los objetos por su "forma" (shape-matching):
 *    - media/post : tiene `code`|`shortcode` y (taken_at|caption|edge_media_to_caption)
 *    - comentario : tiene `text` (string) + `user|owner.username` y NO es caption
 * Se deduplica por pk/id y se fusiona: SSR payload + respuestas GraphQL + DOM.
 *
 * SALIDA: `content` contiene Markdown estructurado listo para un LLM
 * (metadatos, caption, comentarios con autor/fecha/likes, posts relacionados,
 * y notas de extracción para que el LLM sepa qué tan completa es la data).
 * ==========================================================================*/

/* -------------------------------------------------------------------------- */
/* Tipos públicos                                                              */
/* -------------------------------------------------------------------------- */

export interface IgCommentData {
  id: string | null
  username: string | null
  fullName: string | null
  isVerified: boolean | null
  text: string
  createdAtIso: string | null
  likeCount: number | null
  replyCount: number | null
  isReply: boolean
  source: "json" | "graphql" | "dom"
}

export interface IgPostData {
  shortcode: string | null
  url: string
  ownerUsername: string | null
  ownerFullName: string | null
  ownerId: string | null
  ownerVerified: boolean | null
  captionText: string | null
  captionEdited: boolean | null
  takenAtIso: string | null
  mediaType: string | null
  productType: string | null
  carouselCount: number | null
  likeCount: number | null
  commentCount: number | null
  viewCount: number | null
  locationName: string | null
  displayUrl: string | null
  accessibilityCaption: string | null
  likeAndViewCountsDisabled: boolean
  comments: IgCommentData[]
  relatedPosts: {
    shortcode: string
    url: string
    captionPreview: string | null
    displayUrl: string | null
  }[]
  extraction: {
    sources: string[]
    jsonPayloadsParsed: number
    graphqlResponsesCaptured: number
    commentHasNextPage: boolean | null
    warnings: string[]
  }
}

export interface ScrapeOptions {
  instagram?: {
    /** Intentar hacer click en "Load more comments" para traer más comentarios (default: true) */
    expandComments?: boolean
    /** Máximo de clicks de expansión por post (default: 12) */
    maxExpandClicks?: number
  }
}

/* -------------------------------------------------------------------------- */
/* Constantes                                                                  */
/* -------------------------------------------------------------------------- */

const INSTAGRAM_URL_RE = /^https?:\/\/(?:[a-z0-9-]+\.)*instagram\.com\//i
const IG_POST_URL_RE =
  /^https?:\/\/(?:[a-z0-9-]+\.)*instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i

/* -------------------------------------------------------------------------- */
/* Función principal (misma firma que la versión original)                     */
/* -------------------------------------------------------------------------- */

/**
 * Procesa una lista de URLs usando Chromium con Playwright (configuración
 * stealth). Para URLs de Instagram usa un extractor especializado basado en
 * los payloads JSON embebidos (Relay) + intercepción de GraphQL + fallback DOM;
 * para el resto de la web mantiene el comportamiento original (texto plano).
 */
export async function scrapeUrlsWithPlaywright(
  urls: string[],
  options?: ScrapeOptions
): Promise<CrawledPageNode[]> {
  let browser: Browser | null = null
  const results: CrawledPageNode[] = []

  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-web-security",
      ],
    })

    for (const url of urls) {
      const isInstagram = INSTAGRAM_URL_RE.test(url)
      let context: BrowserContext | null = null

      try {
        context = await createStealthContext(browser)
        const page = await context.newPage()

        if (isInstagram) {
          results.push(await scrapeInstagramPage(page, url, options))
        } else {
          results.push(await scrapeGenericPage(page, url))
        }
      } catch (err) {
        const parsedDomain = safeHostname(url)
        results.push({
          url,
          title: url,
          domain: parsedDomain,
          status: "error",
          errorMessage:
            err instanceof Error ? err.message : "Error al cargar la página",
        })
      } finally {
        if (context) {
          await context.close().catch(() => {})
        }
      }
    }

    return results
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Contexto stealth (idéntico al original, factorizado)                        */
/* -------------------------------------------------------------------------- */

async function createStealthContext(browser: Browser): Promise<BrowserContext> {
  const randomWidth = Math.floor(Math.random() * (1440 - 1280 + 1)) + 1280
  const randomHeight = Math.floor(Math.random() * (980 - 820 + 1)) + 820

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    viewport: { width: randomWidth, height: randomHeight },
    locale: "en-US",
    timezoneId: "Europe/London",
    screen: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    extraHTTPHeaders: {
      "accept-language": "en-US,en;q=0.9",
      "sec-ch-ua": '"Chromium";v="133", "Not;A=Brand";v="99"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
    },
  })

  // Script inicial para enmascarar propiedades de automatización (WebDriver)
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => undefined,
    })
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5],
    })
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    })
    // @ts-expect-error mock para emular la API de Google Chrome
    window.chrome = { runtime: {}, loadTimes: () => ({}) }
    Object.defineProperty(screen, "availWidth", { get: () => 1920 })
  })

  return context
}

/* -------------------------------------------------------------------------- */
/* Ruta genérica (comportamiento original, intacto)                            */
/* -------------------------------------------------------------------------- */

async function scrapeGenericPage(
  page: Page,
  url: string
): Promise<CrawledPageNode> {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  })

  // Pequeña espera dinámica para permitir renderizado de frameworks SPA
  await page.waitForTimeout(1000)

  const title = await page.title()
  const cleanedText = await page.evaluate(() => {
    const selectorsToRemove = [
      "script",
      "style",
      "noscript",
      "iframe",
      "svg",
      "nav",
      "footer",
      "header",
      "button",
      "[role='banner']",
      "[role='navigation']",
    ]

    selectorsToRemove.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => el.remove())
    })

    const mainContent =
      document.querySelector("main") ||
      document.querySelector("article") ||
      document.body

    return (mainContent?.innerText || "").replace(/\n\s*\n/g, "\n\n").trim()
  })

  return {
    url,
    title: title || safeHostname(url),
    domain: safeHostname(url),
    content: cleanedText,
    status: "success",
  }
}

/* -------------------------------------------------------------------------- */
/* Ruta Instagram                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Ruta Instagram completa: navegación + extracción.
 * (El listener de GraphQL se registra ANTES de navegar para no perder
 * respuestas tempranas de la app.)
 * Exportado también para poder testearlo con route interception.
 */
export async function scrapeInstagramPage(
  page: Page,
  url: string,
  options?: ScrapeOptions
): Promise<CrawledPageNode> {
  // 1) Interceptar respuestas GraphQL ANTES de navegar. Todos los comentarios
  //    que Instagram cargue dinámicamente (paginación, replies) llegan por aquí.
  const graphqlBodies: unknown[] = []
  page.on("response", (res) => {
    void captureGraphQLResponse(res, graphqlBodies)
  })

  // 2) Navegar
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 })

  return finalizeInstagramExtraction(page, url, graphqlBodies, options)
}

/**
 * Pipeline de extracción sobre una página de Instagram YA navegada.
 * Exportado aparte para poder testearlo end-to-end sin depender de la red.
 */
export async function finalizeInstagramExtraction(
  page: Page,
  url: string,
  graphqlBodies: unknown[],
  options?: ScrapeOptions
): Promise<CrawledPageNode> {
  const igOptions = {
    expandComments: true,
    maxExpandClicks: 12,
    ...(options?.instagram ?? {}),
  }
  const warnings: string[] = []

  if (/\/accounts\/login|\/login\/?$/i.test(page.url()) && page.url() !== url) {
    warnings.push(
      "Instagram redirigió a la pantalla de login; el contenido puede estar limitado"
    )
  }

  // Esperar a que la app hidrate y dispare sus requests iniciales
  await page
    .waitForLoadState("networkidle", { timeout: 10000 })
    .catch(() =>
      warnings.push("timeout esperando networkidle (se continúa igual)")
    )
  await page.waitForTimeout(1200)

  // 3) Descartar overlays (banner de cookies / modal de login) para poder
  //    expandir comentarios. aria-labels estables, sin depender de clases.
  await dismissOverlays(page)

  // 4) Expandir comentarios paginados con clicks (mejor esfuerzo)
  if (igOptions.expandComments) {
    await tryExpandComments(page, igOptions.maxExpandClicks)
  }

  // 5) Recolectar datos en bruto
  const payloadScripts = await collectPayloadScripts(page)
  const domComments = await harvestDomComments(page)

  // 6) Parsear y normalizar (en Node, no en el browser)
  const data = buildInstagramPostData({
    url,
    payloadScripts,
    graphqlBodies,
    domComments,
  })
  data.extraction.warnings.push(...warnings)

  // 7) Fallback: si el payload no dio nada (login wall, post borrado, etc.),
  //    conservar al menos el texto plano de la página.
  let content: string
  if (!data.shortcode && data.comments.length === 0 && !data.captionText) {
    const plain = await extractPlainFallback(page)
    data.extraction.sources.push("plain-text-fallback")
    data.extraction.warnings.push(
      "No se encontró el payload JSON del post (posible login wall, post eliminado o cambio de formato); se adjunta el texto plano de la página"
    )
    content =
      buildInstagramMarkdown(data) +
      (plain
        ? `\n\n## Texto plano de la página (fallback)\n\n${plain}\n`
        : "\n")
  } else {
    content = buildInstagramMarkdown(data)
  }

  const titleParts = [
    "Instagram",
    data.ownerUsername ? `@${data.ownerUsername}` : null,
    data.shortcode,
    data.takenAtIso ? data.takenAtIso.slice(0, 10) : null,
  ].filter(Boolean)

  return {
    url,
    title: titleParts.join(" · "),
    domain: safeHostname(url),
    content,
    status: "success",
  }
}

/** Captura cuerpos JSON de respuestas GraphQL (comentarios paginados, etc.) */
async function captureGraphQLResponse(
  res: PlaywrightResponse,
  sink: unknown[]
): Promise<void> {
  try {
    if (!/graphql/i.test(res.url())) return
    const ct = (res.headers()["content-type"] || "").toLowerCase()
    if (!ct.includes("json")) return
    if (res.status() >= 400) return
    const body = await res.json().catch(() => null)
    if (body && typeof body === "object") sink.push(body)
  } catch {
    /* respuesta ilegible (stream/multipart): se ignora */
  }
}

/** Cierra banner de cookies y modal de login (best-effort, tolerante a idiomas) */
async function dismissOverlays(page: Page): Promise<void> {
  const cookieButtons = page.locator(
    'button:has-text("Allow all cookies"), button:has-text("Permitir todas las cookies"), button:has-text("Allow essential and optional cookies"), button:has-text("Permitir cookies opcionales y técnicas")'
  )
  if ((await cookieButtons.count()) > 0) {
    await cookieButtons
      .first()
      .click({ timeout: 1500 })
      .catch(() => {})
    await page.waitForTimeout(400)
  }

  const closeButtons = page.locator(
    '[aria-label="Close"], [aria-label="Cerrar"]'
  )
  const closeCount = Math.min(await closeButtons.count(), 2)
  for (let i = 0; i < closeCount; i++) {
    const btn = closeButtons.first()
    const visible = await btn.isVisible().catch(() => false)
    if (!visible) break
    await btn.click({ timeout: 1500 }).catch(() => {})
    await page.waitForTimeout(400)
  }
}

/** Hace clicks en "Load more comments" / "Ver respuestas" usando aria-labels estables */
async function tryExpandComments(page: Page, maxClicks: number): Promise<void> {
  // Scroll suave para asegurar que el panel de comentarios esté renderizado
  await page.mouse.wheel(0, 400).catch(() => {})
  await page.waitForTimeout(300)
  await page.mouse.wheel(0, 400).catch(() => {})
  await page.waitForTimeout(300)

  const loadMore = page.locator(
    '[aria-label="Load more comments"], [aria-label="Cargar más comentarios"]'
  )
  const loadMoreByText = page.getByRole("button", {
    name: /load (more|all) comments|cargar (más|todos los) comentarios|ver los \d+ comentarios/i,
  })
  const loadReplies = page.getByRole("button", {
    name: /^view (all )?repl(y|ies)|^ver respuestas|^respuestas \(/i,
  })

  let clicks = 0
  for (let i = 0; i < maxClicks * 2 && clicks < maxClicks; i++) {
    const target =
      (await firstVisible(page, loadMore)) ??
      (await firstVisible(page, loadMoreByText)) ??
      (await firstVisible(page, loadReplies))
    if (!target) break
    await target.click({ timeout: 2000 }).catch(() => null)
    clicks++
    await page.waitForTimeout(900)
  }
}

/** Devuelve el primer locator visible de una lista, o null */
async function firstVisible(
  page: Page,
  locator: ReturnType<Page["getByRole"]> | ReturnType<Page["locator"]>
) {
  try {
    const n = await locator.count()
    for (let i = 0; i < Math.min(n, 5); i++) {
      const el = locator.nth(i)
      if (await el.isVisible().catch(() => false)) return el
    }
  } catch {
    /* noop */
  }
  return null
}

/**
 * Recolecta los contenidos de todos los <script type="application/json">
 * del HTML inicial (payloads de hidratación Relay/ScheduledServerJS).
 * Esto se hace en el BROWSER porque es trivial; el parseo pesado va en Node.
 */
async function collectPayloadScripts(page: Page): Promise<string[]> {
  return page
    .evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/json"]'))
        .map((s) => s.textContent || "")
        .filter((t) => t.length > 2)
    )
    .catch(() => [])
}

/**
 * FALLBACK SOLO-DOM (último recurso): intenta leer comentarios de la UI sin
 * depender de clases hasheadas. Usa la estructura <ul><li><a href="/user/">…
 * que Instagram mantiene estable. Se ignora si el JSON ya dio comentarios.
 */
async function harvestDomComments(
  page: Page
): Promise<
  { username: string | null; text: string; datetime: string | null }[]
> {
  return page
    .evaluate(() => {
      const profileRe = /^\/([A-Za-z0-9._]{1,30})\/$/
      const junkRe =
        /^(me gusta|like|comentar|comment|compartir|share|guardar|save|responder|reply)/i
      const out: {
        username: string | null
        text: string
        datetime: string | null
      }[] = []

      document.querySelectorAll("ul li, div[role='listitem']").forEach((li) => {
        if (out.length >= 200) return
        const anchor = li.querySelector("a[href^='/']")
        if (!anchor) return
        const href = anchor.getAttribute("href") || ""
        const m = href.match(profileRe)
        if (!m) return
        const username = m[1]
        const raw = (li as HTMLElement).innerText || ""
        const text = raw.replace(/\s+/g, " ").trim()
        if (text.length < username.length + 2 || text.length > 1200) return
        if (junkRe.test(text)) return
        const time = li.querySelector("time[datetime]")
        out.push({
          username,
          text: text.slice(username.length).trim() || text,
          datetime: time ? time.getAttribute("datetime") : null,
        })
      })

      return out
    })
    .catch(() => [])
}

/** Texto plano de la página como último recurso (limpieza estilo original) */
async function extractPlainFallback(page: Page): Promise<string> {
  return page
    .evaluate(() => {
      document
        .querySelectorAll(
          "script, style, noscript, svg, [role='banner'], [role='navigation']"
        )
        .forEach((el) => el.remove())
      return (document.body?.innerText || "")
        .replace(/\n\s*\n/g, "\n\n")
        .trim()
        .slice(0, 20000)
    })
    .catch(() => "")
}

/* -------------------------------------------------------------------------- */
/* Parseo / normalización (Node puro, testeable)                               */
/* -------------------------------------------------------------------------- */

type JsonRecord = Record<string, unknown>

interface RawHarvest {
  media: JsonRecord[]
  comments: JsonRecord[]
  commentHasNextPage: boolean | null
  sawCommentsPageInfo: boolean
}

function asRecord(v: unknown): JsonRecord | null {
  return v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as JsonRecord)
    : null
}

function hasUsername(o: JsonRecord): boolean {
  for (const key of ["user", "owner"]) {
    const u = asRecord(o[key])
    if (u && typeof u.username === "string" && u.username.length > 0)
      return true
  }
  return typeof o.username === "string"
}

function looksLikePost(o: JsonRecord): boolean {
  const hasCode = typeof o.code === "string" || typeof o.shortcode === "string"
  if (!hasCode) return false
  return (
    o.taken_at != null ||
    o.taken_at_timestamp != null ||
    o.caption != null ||
    o.edge_media_to_caption != null ||
    o.image_versions2 != null ||
    o.carousel_media != null
  )
}

function looksLikeComment(o: JsonRecord, inCaption: boolean): boolean {
  if (inCaption) return false
  if (typeof o.text !== "string" || o.text.trim().length === 0) return false
  if (o.__typename === "XIGComment") return true
  if (looksLikePost(o)) return false
  return hasUsername(o)
}

const CAPTION_KEY_RE =
  /^(caption|edge_media_to_caption|preview_comments_caption)$/i

/**
 * Recorre cualquier JSON de forma recursiva y clasifica objetos por su forma.
 * Ignora los subárboles de caption para no confundir el caption (que en
 * formatos viejos lleva user.username) con un comentario.
 */
function harvestJson(
  root: unknown,
  sink: RawHarvest,
  inCaption = false,
  depth = 0,
  seen = new Set<object>(),
  parentKey = ""
): void {
  if (depth > 60) return

  if (Array.isArray(root)) {
    for (const item of root)
      harvestJson(item, sink, inCaption, depth + 1, seen, parentKey)
    return
  }

  const obj = asRecord(root)
  if (!obj) return
  if (seen.has(obj)) return
  seen.add(obj)

  if (looksLikePost(obj)) {
    sink.media.push(obj)
  } else if (looksLikeComment(obj, inCaption)) {
    sink.comments.push(obj)
  }

  // Señal de paginación de comentarios: { edges: [...], page_info: {...} }
  // encontrado bajo una clave tipo *comment* (comments_connection,
  // edge_media_to_comment, xdt_api__v1__media__comments__connection, etc.)
  const pageInfo = asRecord(obj.page_info)
  if (
    Array.isArray(obj.edges) &&
    pageInfo &&
    typeof pageInfo.has_next_page === "boolean" &&
    /comment/i.test(parentKey) &&
    pageInfo.has_next_page
  ) {
    sink.commentHasNextPage = true
    sink.sawCommentsPageInfo = true
  } else if (
    Array.isArray(obj.edges) &&
    pageInfo &&
    typeof pageInfo.has_next_page === "boolean" &&
    /comment/i.test(parentKey)
  ) {
    sink.sawCommentsPageInfo = true
  }

  for (const [key, value] of Object.entries(obj)) {
    const childInCaption =
      inCaption || CAPTION_KEY_RE.test(key) || key === "edge_media_to_caption"
    harvestJson(value, sink, childInCaption, depth + 1, seen, key)
  }
}

function toIsoTimestamp(value: unknown): string | null {
  const n = typeof value === "string" ? Number(value) : value
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return null
  const ms = n > 1e12 ? n : n * 1000 // soporta unix seg y unix ms
  const d = new Date(ms)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (
    typeof value === "string" &&
    value.trim() !== "" &&
    Number.isFinite(Number(value))
  ) {
    return Number(value)
  }
  return null
}

/** Devuelve el primer string no vacío de la lista, o null */
function firstString(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === "string" && v.trim() !== "") return v
  }
  return null
}

function extractCaptionText(post: JsonRecord): string | null {
  const cap = post.caption
  if (typeof cap === "string" && cap.trim()) return cap
  const capObj = asRecord(cap)
  if (capObj && typeof capObj.text === "string" && capObj.text.trim())
    return capObj.text

  const edges = asRecord(post.edge_media_to_caption)
  const edgesArr = edges && Array.isArray(edges.edges) ? edges.edges : null
  if (edgesArr && edgesArr.length > 0) {
    const node = asRecord((edgesArr[0] as JsonRecord | undefined)?.node)
    if (node && typeof node.text === "string" && node.text.trim())
      return node.text
  }
  return null
}

function describeMediaType(post: JsonRecord): string | null {
  const mt = toNumber(post.media_type)
  if (mt === 1) return "imagen"
  if (mt === 2) return "vídeo"
  if (mt === 8) return "carrusel"
  const typename = [post.__typename, post.__isXIGPolarisMedia]
    .filter((v): v is string => typeof v === "string")
    .join(" ")
  if (/image/i.test(typename)) return "imagen"
  if (/video|clip/i.test(typename)) return "vídeo"
  if (/carousel|sidecar/i.test(typename)) return "carrusel"
  return null
}

function normalizeOwner(post: JsonRecord): {
  username: string | null
  fullName: string | null
  id: string | null
  verified: boolean | null
} {
  let username: string | null = null
  let fullName: string | null = null
  let id: string | null = null
  let verified: boolean | null = null

  for (const key of ["user", "owner"]) {
    const u = asRecord(post[key])
    if (!u) continue
    username ??= typeof u.username === "string" ? u.username : null
    fullName ??=
      typeof u.full_name === "string" && u.full_name ? u.full_name : null
    verified ??= typeof u.is_verified === "boolean" ? u.is_verified : null
    id ??= u.pk != null ? String(u.pk) : typeof u.id === "string" ? u.id : null
  }
  return { username, fullName, id, verified }
}

function normalizeComment(
  node: JsonRecord,
  source: IgCommentData["source"]
): IgCommentData | null {
  const text = typeof node.text === "string" ? node.text.trim() : ""
  if (!text) return null

  let username: string | null = null
  let fullName: string | null = null
  let verified: boolean | null = null
  for (const key of ["user", "owner"]) {
    const u = asRecord(node[key])
    if (!u) continue
    username ??= typeof u.username === "string" ? u.username : null
    fullName ??=
      typeof u.full_name === "string" && u.full_name ? u.full_name : null
    verified ??= typeof u.is_verified === "boolean" ? u.is_verified : null
  }
  if (typeof node.username === "string") username ??= node.username

  const likeCount =
    toNumber(node.comment_like_count) ?? toNumber(node.comment_likes)
  const replyCountRaw =
    toNumber(node.child_comment_count) ??
    (asRecord(node.edge_threaded_comments)
      ? toNumber(asRecord(node.edge_threaded_comments)!.count)
      : null)

  return {
    id:
      node.pk != null
        ? String(node.pk)
        : typeof node.id === "string"
          ? node.id
          : null,
    username,
    fullName,
    isVerified: verified,
    text,
    createdAtIso: toIsoTimestamp(node.created_at ?? node.created_time),
    likeCount,
    replyCount: replyCountRaw,
    isReply: node.parent_comment_id != null,
    source,
  }
}

function dedupeComments(comments: IgCommentData[]): IgCommentData[] {
  const byKey = new Map<string, IgCommentData>()
  for (const c of comments) {
    const key =
      c.id ??
      `${c.username ?? "?"}|${c.text.slice(0, 80)}|${c.createdAtIso ?? "?"}`
    if (!byKey.has(key)) byKey.set(key, c)
  }
  // Comentarios principales primero (por fecha), respuestas después
  const topLevel = [...byKey.values()]
    .filter((c) => !c.isReply)
    .sort((a, b) => (a.createdAtIso ?? "").localeCompare(b.createdAtIso ?? ""))
  const replies = [...byKey.values()]
    .filter((c) => c.isReply)
    .sort((a, b) => (a.createdAtIso ?? "").localeCompare(b.createdAtIso ?? ""))
  return [...topLevel, ...replies]
}

/**
 * Fusiona todas las fuentes (payloads SSR + GraphQL + DOM) y elige el post
 * principal: el que coincide con el shortcode de la URL; el resto se trata
 * como posts relacionados del mismo autor.
 */
export function buildInstagramPostData(params: {
  url: string
  payloadScripts: string[]
  graphqlBodies: unknown[]
  domComments: {
    username: string | null
    text: string
    datetime: string | null
  }[]
}): IgPostData {
  const { url, payloadScripts, graphqlBodies, domComments } = params
  const warnings: string[] = []
  const sources: string[] = []

  const harvest: RawHarvest = {
    media: [],
    comments: [],
    commentHasNextPage: null,
    sawCommentsPageInfo: false,
  }

  let parsedPayloads = 0
  for (const script of payloadScripts) {
    try {
      const json: unknown = JSON.parse(script)
      parsedPayloads++
      harvestJson(json, harvest)
    } catch {
      /* payload no-JSON: se ignora */
    }
  }
  if (
    parsedPayloads > 0 &&
    (harvest.media.length > 0 || harvest.comments.length > 0)
  ) {
    sources.push(`payload-ssr-relay (${parsedPayloads} scripts JSON)`)
  }

  let graphqlCount = 0
  for (const body of graphqlBodies) {
    const before = harvest.comments.length
    harvestJson(body, harvest)
    if (harvest.comments.length > before || harvest.media.length > 0)
      graphqlCount++
  }
  if (graphqlBodies.length > 0) {
    sources.push(`graphql (${graphqlBodies.length} respuestas capturadas)`)
  }

  const shortcodeFromUrl = url.match(IG_POST_URL_RE)?.[1] ?? null

  // --- Elegir el post principal ---
  const scored = harvest.media.map((m) => {
    const code =
      typeof m.code === "string"
        ? m.code
        : typeof m.shortcode === "string"
          ? (m.shortcode as string)
          : null
    let score = 0
    if (code && shortcodeFromUrl && code === shortcodeFromUrl) score += 1000
    if (m.taken_at != null || m.taken_at_timestamp != null) score += 100
    if (m.like_count != null) score += 10
    if (m.comment_count != null) score += 10
    if (asRecord(m.user)?.username || asRecord(m.owner)?.username) score += 5
    return { m, code, score }
  })
  scored.sort((a, b) => b.score - a.score)

  const mainEntry = scored[0] ?? null
  const mainPost = mainEntry?.m ?? null

  let data: IgPostData
  if (mainPost) {
    const owner = normalizeOwner(mainPost)
    const code = mainEntry!.code ?? shortcodeFromUrl
    const carouselCount =
      toNumber(mainPost.carousel_media_count) ??
      (Array.isArray(mainPost.carousel_media)
        ? mainPost.carousel_media.length
        : null) ??
      (() => {
        const sidecar = asRecord(mainPost.edge_sidecar_to_children)
        return sidecar && Array.isArray(sidecar.edges)
          ? sidecar.edges.length
          : null
      })()

    const likeCount =
      toNumber(mainPost.like_count) ??
      (() => {
        for (const key of [
          "edge_media_preview_like",
          "edge_liked_by",
          "edge_media_like",
        ]) {
          const e = asRecord(mainPost[key])
          const n = e ? toNumber(e.count) : null
          if (n != null) return n
        }
        return null
      })()

    const commentCount =
      toNumber(mainPost.comment_count) ??
      (() => {
        const e = asRecord(mainPost.edge_media_to_comment)
        return e ? toNumber(e.count) : null
      })()

    const viewCount =
      toNumber(mainPost.view_count) ??
      toNumber(mainPost.play_count) ??
      toNumber(mainPost.video_view_count)

    const imageVersions = asRecord(mainPost.image_versions2)
    const imageCandidates =
      imageVersions && Array.isArray(imageVersions.candidates)
        ? imageVersions.candidates
        : []
    const firstCandidate =
      imageCandidates.length > 0 ? asRecord(imageCandidates[0]) : null
    const displayUrl = firstString(
      mainPost.display_uri,
      mainPost.display_url,
      firstCandidate?.url,
      mainPost.thumbnail_src
    )

    const location = asRecord(mainPost.location)

    const comments = dedupeComments(
      harvest.comments
        .map((c) => normalizeComment(c, "json"))
        .filter((c): c is IgCommentData => c !== null)
    )

    // Posts relacionados: mismo autor, otros shortcodes
    const seenCodes = new Set<string>([code ?? ""])
    const relatedPosts: IgPostData["relatedPosts"] = []
    for (const { m, code: relCode } of scored) {
      if (!relCode || seenCodes.has(relCode)) continue
      seenCodes.add(relCode)
      const capText = extractCaptionText(m)
      relatedPosts.push({
        shortcode: relCode,
        url: `https://www.instagram.com/p/${relCode}/`,
        captionPreview: capText ? capText.slice(0, 220) : null,
        displayUrl: firstString(m.display_uri, m.display_url),
      })
      if (relatedPosts.length >= 12) break
    }

    data = {
      shortcode: code,
      url: code ? `https://www.instagram.com/p/${code}/` : url,
      ownerUsername: owner.username,
      ownerFullName: owner.fullName,
      ownerId: owner.id,
      ownerVerified: owner.verified,
      captionText: extractCaptionText(mainPost),
      captionEdited:
        typeof mainPost.caption_is_edited === "boolean"
          ? mainPost.caption_is_edited
          : null,
      takenAtIso: toIsoTimestamp(
        mainPost.taken_at ?? mainPost.taken_at_timestamp
      ),
      mediaType: describeMediaType(mainPost),
      productType:
        typeof mainPost.product_type === "string"
          ? mainPost.product_type
          : null,
      carouselCount,
      likeCount,
      commentCount,
      viewCount,
      locationName:
        location && typeof location.name === "string" ? location.name : null,
      displayUrl,
      accessibilityCaption:
        typeof mainPost.accessibility_caption === "string"
          ? mainPost.accessibility_caption
          : null,
      likeAndViewCountsDisabled:
        mainPost.like_and_view_counts_disabled === true,
      comments,
      relatedPosts,
      extraction: {
        sources,
        jsonPayloadsParsed: parsedPayloads,
        graphqlResponsesCaptured: graphqlBodies.length,
        commentHasNextPage:
          harvest.commentHasNextPage ??
          (harvest.sawCommentsPageInfo ? false : null),
        warnings: [],
      },
    }
  } else {
    // Sin payload reconocible: al menos la URL y lo que haya
    data = {
      shortcode: shortcodeFromUrl,
      url,
      ownerUsername: null,
      ownerFullName: null,
      ownerId: null,
      ownerVerified: null,
      captionText: null,
      captionEdited: null,
      takenAtIso: null,
      mediaType: null,
      productType: null,
      carouselCount: null,
      likeCount: null,
      commentCount: null,
      viewCount: null,
      locationName: null,
      displayUrl: null,
      accessibilityCaption: null,
      likeAndViewCountsDisabled: false,
      comments: [],
      relatedPosts: [],
      extraction: {
        sources,
        jsonPayloadsParsed: parsedPayloads,
        graphqlResponsesCaptured: graphqlBodies.length,
        commentHasNextPage:
          harvest.commentHasNextPage ??
          (harvest.sawCommentsPageInfo ? false : null),
        warnings: [
          "No se pudo identificar el objeto del post en los payloads JSON",
        ],
      },
    }
  }

  // --- Fallback DOM: solo si el JSON no dio ningún comentario ---
  if (data.comments.length === 0 && domComments.length > 0) {
    data.extraction.sources.push("dom-fallback")
    data.extraction.warnings.push(
      "Los comentarios se obtuvieron del DOM por fallback (menos fiable: sin fecha ni likes garantizados)"
    )
    for (const dc of domComments) {
      data.comments.push({
        id: null,
        username: dc.username,
        fullName: null,
        isVerified: null,
        text: dc.text,
        createdAtIso: dc.datetime,
        likeCount: null,
        replyCount: null,
        isReply: false,
        source: "dom",
      })
    }
  }

  // --- Avisos de cobertura ---
  if (data.commentCount != null && data.comments.length < data.commentCount) {
    data.extraction.warnings.push(
      `Se extrajeron ${data.comments.length} de ${data.commentCount} comentarios (Instagram limita los comentarios visibles para sesiones sin login; el resto requiere paginar vía GraphQL autenticada)`
    )
  }
  if (data.extraction.commentHasNextPage) {
    data.extraction.warnings.push(
      "comments_connection.page_info.has_next_page = true (quedan comentarios sin cargar)"
    )
  }
  if (data.likeAndViewCountsDisabled) {
    data.extraction.warnings.push(
      "El autor ocultó los contadores de likes/vistas (like_and_view_counts_disabled)"
    )
  }

  return data
}

/* -------------------------------------------------------------------------- */
/* Generador de Markdown (salida para el LLM)                                  */
/* -------------------------------------------------------------------------- */

function fmtIso(iso: string | null): string {
  if (!iso) return "n/d"
  return `${iso.slice(0, 10)} ${iso.slice(11, 19)} UTC`
}

function mdEscapeCell(s: string): string {
  return s.replace(/\s+/g, " ").trim()
}

export function buildInstagramMarkdown(data: IgPostData): string {
  const nd = "n/d"
  const lines: string[] = []

  const headerName = data.ownerUsername
    ? `@${data.ownerUsername}`
    : data.shortcode
      ? data.shortcode
      : "publicación de Instagram"
  lines.push(`# Instagram — ${headerName}`)
  lines.push("")

  lines.push("## Datos de la publicación")
  lines.push("")
  lines.push(`- **URL:** ${data.url}`)
  lines.push(`- **Shortcode:** ${data.shortcode ?? nd}`)
  lines.push(
    `- **Autor:** ${data.ownerUsername ? `@${data.ownerUsername}` : nd}` +
      (data.ownerFullName ? ` — ${data.ownerFullName}` : "") +
      (data.ownerVerified ? " *(cuenta verificada)*" : "")
  )
  lines.push(`- **ID de usuario:** ${data.ownerId ?? nd}`)
  lines.push(`- **Fecha de publicación:** ${fmtIso(data.takenAtIso)}`)
  const mediaDesc = [
    data.mediaType,
    data.productType === "clips" ? "reel" : data.productType,
  ]
    .filter(Boolean)
    .join(" · ")
  lines.push(
    `- **Tipo de media:** ${mediaDesc || nd}${data.carouselCount ? ` (${data.carouselCount} elementos)` : ""}`
  )
  lines.push(
    `- **Likes:** ${data.likeAndViewCountsDisabled ? "ocultos por el autor" : (data.likeCount ?? nd)}`
  )
  lines.push(`- **Comentarios (total reportado):** ${data.commentCount ?? nd}`)
  lines.push(`- **Comentarios extraídos:** ${data.comments.length}`)
  if (data.viewCount != null)
    lines.push(`- **Vistas/reproducciones:** ${data.viewCount}`)
  lines.push(`- **Ubicación:** ${data.locationName ?? nd}`)
  if (data.displayUrl)
    lines.push(`- **Imagen principal (CDN):** ${data.displayUrl}`)
  lines.push("")

  lines.push("## Caption (texto del autor)")
  lines.push("")
  if (data.captionText) {
    lines.push(data.captionText.trim())
    if (data.captionEdited === true) {
      lines.push("")
      lines.push("_(caption editado)_")
    }
  } else {
    lines.push("_(sin caption o no disponible)_")
  }
  lines.push("")

  if (data.accessibilityCaption) {
    lines.push(
      "## Descripción de accesibilidad (qué muestra la imagen, generado por Instagram)"
    )
    lines.push("")
    lines.push(data.accessibilityCaption.trim())
    lines.push("")
  }

  lines.push(`## Comentarios (${data.comments.length})`)
  lines.push("")
  if (data.comments.length === 0) {
    lines.push("_(no se pudieron extraer comentarios)_")
    lines.push("")
  } else {
    data.comments.forEach((c, i) => {
      const badge = c.isReply ? " (respuesta)" : ""
      const verified = c.isVerified ? " ✔" : ""
      const meta = [
        c.createdAtIso ? fmtIso(c.createdAtIso) : null,
        c.likeCount != null ? `likes: ${c.likeCount}` : null,
        c.replyCount != null && c.replyCount > 0
          ? `respuestas: ${c.replyCount}`
          : null,
        c.id ? `id: ${c.id}` : null,
        `fuente: ${c.source}`,
      ]
        .filter(Boolean)
        .join(" · ")
      lines.push(
        `### ${i + 1}. ${c.username ? `@${c.username}` : "(usuario desconocido)"}${verified}${badge} — ${c.createdAtIso ? fmtIso(c.createdAtIso) : "fecha n/d"}`
      )
      lines.push("")
      lines.push(c.text.trim())
      lines.push("")
      lines.push(`_${meta}_`)
      lines.push("")
    })
  }

  if (data.relatedPosts.length > 0) {
    lines.push(
      `## Publicaciones relacionadas del mismo autor (${data.relatedPosts.length})`
    )
    lines.push("")
    data.relatedPosts.forEach((r, i) => {
      const preview = r.captionPreview
        ? ` — "${mdEscapeCell(r.captionPreview)}${r.captionPreview.length >= 220 ? "…" : ""}"`
        : ""
      lines.push(`${i + 1}. ${r.url}${preview}`)
    })
    lines.push("")
  }

  lines.push("## Notas de extracción")
  lines.push("")
  lines.push(
    `- Fuentes: ${data.extraction.sources.length > 0 ? data.extraction.sources.join(", ") : "ninguna (no se reconoció el payload)"}`
  )
  lines.push(
    `- Payloads JSON analizados: ${data.extraction.jsonPayloadsParsed}`
  )
  lines.push(
    `- Respuestas GraphQL capturadas: ${data.extraction.graphqlResponsesCaptured}`
  )
  lines.push(
    `- Paginación de comentarios pendiente: ${
      data.extraction.commentHasNextPage == null
        ? "desconocida"
        : data.extraction.commentHasNextPage
          ? "sí"
          : "no"
    }`
  )
  if (data.extraction.warnings.length > 0) {
    lines.push("- Advertencias:")
    for (const w of data.extraction.warnings) lines.push(`  - ${w}`)
  } else {
    lines.push("- Advertencias: ninguna")
  }
  lines.push("")

  return (
    lines
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n"
  )
}

/* -------------------------------------------------------------------------- */
/* Utilidades                                                                  */
/* -------------------------------------------------------------------------- */

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

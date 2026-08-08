import { chromium, type Browser } from "playwright"
import type { CrawledPageNode } from "../types"

/**
 * Procesa una lista de URLs usando Chromium con Playwright (Configuración Stealth)
 * y extrae el contenido estructurado en Markdown limpio y optimizado para LLMs.
 */
export async function scrapeUrlsWithPlaywright(
  urls: string[]
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
      try {
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

        // Enmascarar propiedades de automatización (Stealth)
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

        const page = await context.newPage()

        // Bloquear recursos innecesarios (imágenes, fuentes, media) para acelerar extracción
        await page.route(
          /\.(png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot|mp4|webm|mp3)$/i,
          (route) => route.abort()
        )

        // Navegación a la URL objetivo
        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        })

        // Pequeña espera dinámica para permitir renderizado en SPAs
        await page.waitForTimeout(1000)

        const extractedData = await page.evaluate(() => {
          // 1. SELECTORES DE ELEMENTOS A DESCARTAR (Ruido, anuncios, banners, cookies)
          const selectorsToRemove = [
            "script",
            "style",
            "noscript",
            "template",
            "iframe",
            "svg",
            "canvas",
            "video",
            "audio",
            "nav",
            "footer",
            "header",
            "button",
            "form",
            "aside",
            "dialog",
            "select",
            "input",
            "textarea",
            "[role='banner']",
            "[role='navigation']",
            "[role='dialog']",
            "[role='alertdialog']",
            "[role='complementary']",
            "[aria-hidden='true']",
            ".cookie-banner",
            ".cookie-notice",
            "#cookie-banner",
            "#onetrust-consent-sdk",
            ".adsbygoogle",
            ".advertisement",
            ".modal",
          ]

          selectorsToRemove.forEach((sel) => {
            document.querySelectorAll(sel).forEach((el) => el.remove())
          })

          // 2. EXTRAER METADATOS BÁSICOS
          const metaDesc =
            document
              .querySelector('meta[name="description"]')
              ?.getAttribute("content") ||
            document
              .querySelector('meta[property="og:description"]')
              ?.getAttribute("content") ||
            ""

          const metaTitle =
            document
              .querySelector('meta[property="og:title"]')
              ?.getAttribute("content") ||
            document.title ||
            ""

          // 3. AISLAR CONTENEDOR PRINCIPAL
          const mainElement =
            document.querySelector("main") ||
            document.querySelector("article") ||
            document.querySelector('[role="main"]') ||
            document.querySelector("#content") ||
            document.querySelector(".main-content") ||
            document.body

          if (!mainElement) {
            return { title: metaTitle, markdown: "" }
          }

          // 4. PARSER DE TABLAS A GFM (GitHub Flavored Markdown)
          const parseTableToMarkdown = (table: HTMLTableElement): string => {
            const rows = Array.from(table.querySelectorAll("tr"))
            if (!rows.length) return ""

            const grid = rows.map((row) =>
              Array.from(row.querySelectorAll("th, td")).map((cell) =>
                (cell.textContent || "")
                  .replace(/\|/g, "\\|")
                  .replace(/\s+/g, " ")
                  .trim()
              )
            )

            const maxCols = Math.max(...grid.map((r) => r.length), 0)
            if (maxCols === 0) return ""

            const normalizedGrid = grid.map((r) => {
              while (r.length < maxCols) r.push("")
              return r
            })

            const headerRow = normalizedGrid[0]!
            const separatorRow = new Array(maxCols).fill("---")
            const bodyRows = normalizedGrid.slice(1)

            const tableMd = [
              `| ${headerRow.join(" | ")} |`,
              `| ${separatorRow.join(" | ")} |`,
              ...bodyRows.map((r) => `| ${r.join(" | ")} |`),
            ].join("\n")

            return `\n\n${tableMd}\n\n`
          }

          // 5. PARSER RECURSIVO DEL DOM A MARKDOWN LIMPIO
          const domToMarkdown = (node: Node): string => {
            if (node.nodeType === Node.TEXT_NODE) {
              return node.textContent || ""
            }

            if (node.nodeType !== Node.ELEMENT_NODE) {
              return ""
            }

            const el = node as HTMLElement
            const tagName = el.tagName.toLowerCase()

            // Ignorar elementos ocultos por CSS inline
            if (
              el.style.display === "none" ||
              el.style.visibility === "hidden"
            ) {
              return ""
            }

            // Manejo de bloques de código
            if (tagName === "pre") {
              const codeEl = el.querySelector("code")
              const langClass = codeEl?.className.match(/language-(\w+)/)
              const lang = langClass ? langClass[1] : ""
              const rawCode = (codeEl || el).textContent || ""
              return `\n\n\`\`\`${lang}\n${rawCode.trim()}\n\`\`\`\n\n`
            }

            if (tagName === "code") {
              // Si ya está dentro de un <pre>, no duplicar backticks
              if (el.parentElement?.tagName.toLowerCase() === "pre") {
                return el.textContent || ""
              }
              const inlineCode = (el.textContent || "").trim()
              return inlineCode ? ` \`${inlineCode}\` ` : ""
            }

            // Manejo de tablas
            if (tagName === "table") {
              return parseTableToMarkdown(el as HTMLTableElement)
            }

            // Recorrer hijos
            const childrenText = Array.from(el.childNodes)
              .map((child) => domToMarkdown(child))
              .join("")

            switch (tagName) {
              case "h1":
                return `\n\n# ${childrenText.trim()}\n\n`
              case "h2":
                return `\n\n## ${childrenText.trim()}\n\n`
              case "h3":
                return `\n\n### ${childrenText.trim()}\n\n`
              case "h4":
                return `\n\n#### ${childrenText.trim()}\n\n`
              case "h5":
                return `\n\n##### ${childrenText.trim()}\n\n`
              case "h6":
                return `\n\n###### ${childrenText.trim()}\n\n`
              case "p":
                return `\n\n${childrenText.trim()}\n\n`
              case "blockquote":
                return `\n\n> ${childrenText.trim().replace(/\n+/g, "\n> ")}\n\n`
              case "ul":
              case "ol":
                return `\n\n${childrenText.trim()}\n\n`
              case "li": {
                const text = childrenText.trim()
                return text ? `\n- ${text}` : ""
              }
              case "strong":
              case "b": {
                const text = childrenText.trim()
                return text ? ` **${text}** ` : ""
              }
              case "em":
              case "i": {
                const text = childrenText.trim()
                return text ? ` *${text}* ` : ""
              }
              case "a": {
                const href = el.getAttribute("href")
                const text = childrenText.trim()
                if (!text) return ""
                if (
                  !href ||
                  href.startsWith("#") ||
                  href.startsWith("javascript:") ||
                  href.startsWith("mailto:")
                ) {
                  return text
                }
                return ` [${text}](${href}) `
              }
              case "hr":
                return "\n\n---\n\n"
              case "br":
                return "\n"
              default:
                return childrenText
            }
          }

          const rawMarkdown = domToMarkdown(mainElement)

          // 6. POST-PROCESAMIENTO: LIMPIEZA DE ESPACIOS Y DUPLICADOS
          const cleanMarkdown = rawMarkdown
            // Colapsar espacios horizontales múltiples a uno solo
            .replace(/[ \t]+/g, " ")
            // Eliminar espacios vacíos al inicio/fin de cada línea
            .split("\n")
            .map((line) => line.trim())
            .join("\n")
            // Máximo 2 saltos de línea consecutivos para preservar párrafos
            .replace(/\n{3,}/g, "\n\n")
            .trim()

          // Prepend de metadata si existe descripción
          const finalMarkdown = metaDesc
            ? `> **Descripción:** ${metaDesc.trim()}\n\n---\n\n${cleanMarkdown}`
            : cleanMarkdown

          return {
            title: metaTitle,
            markdown: finalMarkdown,
          }
        })

        const parsedDomain = new URL(url).hostname

        results.push({
          url,
          title: extractedData.title || parsedDomain,
          domain: parsedDomain,
          content: extractedData.markdown,
          status: "success",
        })

        await context.close()
      } catch (err) {
        const parsedDomain = new URL(url).hostname
        results.push({
          url,
          title: url,
          domain: parsedDomain,
          status: "error",
          errorMessage:
            err instanceof Error ? err.message : "Error al cargar la página",
        })
      }
    }

    return results
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

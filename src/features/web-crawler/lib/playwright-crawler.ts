import { chromium, type Browser } from "playwright"
import type { CrawledPageNode } from "../types"

/**
 * Procesa una lista de URLs usando Chromium con Playwright (Configuración Stealth)
 * y extrae el texto limpio de cada página.
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

        const page = await context.newPage()

        // Navegación a la URL objetivo
        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        })

        // Pequeña espera dinámica para permitir renderizado de frameworks SPA (React/Vue/Svelte)
        await page.waitForTimeout(1000)

        const title = await page.title()
        const cleanedText = await page.evaluate(() => {
          // Eliminar elementos irrelevantes para contexto LLM
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

          return (mainContent?.innerText || "")
            .replace(/\n\s*\n/g, "\n\n")
            .trim()
        })

        const parsedDomain = new URL(url).hostname

        results.push({
          url,
          title: title || parsedDomain,
          domain: parsedDomain,
          content: cleanedText,
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

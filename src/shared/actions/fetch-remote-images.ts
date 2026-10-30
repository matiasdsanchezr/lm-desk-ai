"use server"

import { ActionResponse } from "@/shared/types/action-state"
import { ImageFile } from "@/shared/types/image-file"
import { lookup } from "node:dns/promises"
import { isIP } from "node:net"
import { z } from "zod"

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB límite
const FETCH_TIMEOUT_MS = 7_000 // 7 segundos de timeout

const remoteImagesSchema = z.object({
  urls: z
    .array(z.string().url("Formato de URL inválido"))
    .max(10, "Máximo 10 imágenes a la vez"),
})

export interface FetchRemoteImagesResult {
  images: ImageFile[]
  failedUrls: string[]
}

/**
 * Determina si una IP pertenece a rangos privados, loopback o metadatos de nube.
 */
function isPrivateOrReservedIP(ip: string): boolean {
  // IPv4 Checks
  if (ip.startsWith("127.")) return true // Loopback
  if (ip.startsWith("10.")) return true // Clase A privada
  if (ip.startsWith("192.168.")) return true // Clase C privada
  if (ip.startsWith("169.254.")) return true // Link-local / Cloud metadata (AWS, GCP, Azure)
  if (ip === "0.0.0.0") return true

  // Rango 172.16.0.0 - 172.31.255.255
  if (ip.startsWith("172.")) {
    const secondOctet = Number.parseInt(ip.split(".")[1] ?? "0", 10)
    if (secondOctet >= 16 && secondOctet <= 31) return true
  }

  // IPv6 Checks
  if (ip === "::1" || ip === "::") return true
  if (ip.toLowerCase().startsWith("fe80:")) return true // Link-local IPv6
  if (
    ip.toLowerCase().startsWith("fc00:") ||
    ip.toLowerCase().startsWith("fd00:")
  )
    return true // Unique Local

  return false
}

/**
 * Valida la URL para evitar ataques de SSRF verificando resolución DNS.
 */
async function validateUrlSafety(targetUrl: string): Promise<void> {
  const parsed = new URL(targetUrl)

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Protocolo no admitido")
  }

  const hostname = parsed.hostname

  if (hostname === "localhost" || hostname.endsWith(".local")) {
    throw new Error("Acceso a host local denegado")
  }

  // Si ya es una IP literal
  if (isIP(hostname)) {
    if (isPrivateOrReservedIP(hostname)) {
      throw new Error("Acceso a IP privada denegado")
    }
    return
  }

  // Resolver DNS para prevenir DNS Rebinding a IPs locales
  const addresses = await lookup(hostname, { all: true })
  for (const addr of addresses) {
    if (isPrivateOrReservedIP(addr.address)) {
      throw new Error(
        `Resolución prohibida: host apunta a red interna (${addr.address})`
      )
    }
  }
}

async function fetchRemoteImageAsBase64(src: string): Promise<ImageFile> {
  await validateUrlSafety(src)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(src, {
      signal: controller.signal,
      headers: {
        Accept: "image/png,image/jpeg,image/webp,image/gif;q=0.9,*/*;q=0.1",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} al cargar imagen`)
    }

    const mime = response.headers.get("content-type")
    if (!mime || !mime.startsWith("image/")) {
      throw new Error(`El recurso no es una imagen válida (MIME: ${mime})`)
    }

    const contentLength = response.headers.get("content-length")
    if (
      contentLength &&
      Number.parseInt(contentLength, 10) > MAX_IMAGE_SIZE_BYTES
    ) {
      throw new Error("La imagen supera el límite de 10 MB permitido")
    }

    // Consumo del Stream con conteo de bytes para evitar ataques de descompresión o Content-Length falso
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("No se pudo iniciar la lectura de datos")
    }

    const chunks: Uint8Array[] = []
    let totalBytes = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      if (value) {
        totalBytes += value.length
        if (totalBytes > MAX_IMAGE_SIZE_BYTES) {
          throw new Error("La descarga se canceló: la imagen supera los 10 MB")
        }
        chunks.push(value)
      }
    }

    const concatenated = new Uint8Array(totalBytes)
    let offset = 0
    for (const chunk of chunks) {
      concatenated.set(chunk, offset)
      offset += chunk.length
    }

    const base64ImageData = Buffer.from(concatenated).toString("base64")
    return { mimeType: mime, base64: base64ImageData }
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function fetchRemoteImagesAction(
  rawUrls: string[]
): ActionResponse<FetchRemoteImagesResult> {
  const filteredUrls = rawUrls.map((u) => u.trim()).filter(Boolean)
  const validation = remoteImagesSchema.safeParse({ urls: filteredUrls })

  if (!validation.success) {
    return {
      error: validation.error.issues[0]?.message ?? "URLs inválidas",
    }
  }

  const successfulImages: ImageFile[] = []
  const failedUrls: string[] = []

  await Promise.all(
    validation.data.urls.map(async (url) => {
      try {
        const image = await fetchRemoteImageAsBase64(url)
        successfulImages.push(image)
      } catch (err) {
        console.error(
          `[fetchRemoteImagesAction] Error en ${url}:`,
          err instanceof Error ? err.message : err
        )
        failedUrls.push(url)
      }
    })
  )

  if (successfulImages.length === 0 && failedUrls.length > 0) {
    return {
      error:
        "No se pudo descargar ninguna imagen segura de la lista proporcionada.",
      data: { images: [], failedUrls },
    }
  }

  return {
    data: {
      images: successfulImages,
      failedUrls,
    },
  }
}

"use client"

import { cache, useSyncExternalStore } from "react"

const emptySubscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = cache(() => false)

/**
 * Hook que devuelve `true` solo cuando se ejecuta en el cliente.
 * Útil para evitar errores de hidratación en componentes que
 * dependen de APIs del navegador o datos que difieren entre
 * servidor y cliente (ej: fechas formateadas, IDs únicos).
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot)
}

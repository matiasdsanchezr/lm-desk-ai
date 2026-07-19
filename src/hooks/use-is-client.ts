"use client"

import { useSyncExternalStore } from "react"

/**
 * Hook que devuelve `true` solo cuando se ejecuta en el cliente.
 * Útil para evitar errores de hidratación en componentes que
 * dependen de APIs del navegador o datos que difieren entre
 * servidor y cliente (ej: fechas formateadas, IDs únicos).
 *
 * Usa `useSyncExternalStore` para garantizar consistencia con
 * el modelo de concurrencia de React 19.
 */
const emptySubscribe = () => () => {}

const getSnapshot = () => true
const getServerSnapshot = () => false

export function useIsClient(): boolean {
  return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot)
}

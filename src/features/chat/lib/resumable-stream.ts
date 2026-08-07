import { EventEmitter } from "events"
import { after } from "next/server"
import type { Publisher, Subscriber } from "resumable-stream/generic"
import { createResumableStreamContext } from "resumable-stream/generic"

interface StoreState {
  kv: Record<string, string>
  counters: Record<string, number>
}

const store: StoreState = {
  kv: {},
  counters: {},
}

const bus = new EventEmitter()

const publisher: Publisher = {
  connect: async () => {},

  publish: async (channel: string, message: string) => {
    bus.emit(channel, message)
  },

  set: async (key: string, value: string, options?: { EX?: number }) => {
    store.kv[key] = value

    if (options?.EX) {
      setTimeout(() => {
        delete store.kv[key]
      }, options.EX * 1000)
    }
  },

  get: async (key: string) => {
    return store.kv[key] ?? null
  },

  incr: async (key: string) => {
    const currentValue = store.counters[key] ?? 0
    const nextValue = currentValue + 1
    store.counters[key] = nextValue
    return nextValue
  },
}

const subscriber: Subscriber = {
  connect: async () => {},

  subscribe: async (channel: string, callback: (message: string) => void) => {
    bus.on(channel, callback)
  },

  unsubscribe: async (channel: string) => {
    bus.removeAllListeners(channel)
  },
}

export const streamContext = createResumableStreamContext({
  waitUntil: after,
  publisher,
  subscriber,
})

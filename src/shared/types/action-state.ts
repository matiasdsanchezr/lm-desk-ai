export type ActionState<T = void> = {
  data?: T
  error?: string
  validationErrors?: Record<string, string[]>
}

export type ActionResponse<T = void> = Promise<ActionState<T>>

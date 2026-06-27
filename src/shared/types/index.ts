export type ApiError = {
  message: string
  code?: string
  status: number
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type Maybe<T> = T | null | undefined

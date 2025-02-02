import type { Json } from "tstk"

export interface ValidationResult {
  state: string
  message?: string
  payload?: Json
}

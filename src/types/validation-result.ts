import type { JSONValue } from "./json-value"

export interface ValidationResult {
  state: string
  message?: string
  payload?: JSONValue
}

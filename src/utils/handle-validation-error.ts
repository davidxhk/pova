import type { ValidationResult } from "../types"
import { isAbortError } from "./is-abort-error"

export function handleValidationError(error: any): ValidationResult {
  if (error instanceof Error) {
    return { state: isAbortError(error) ? "aborted" : "error", message: `${error}` }
  }

  return { state: "unknown", message: JSON.stringify(error) }
}

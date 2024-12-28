import type { ValidationResult } from "./validation-result"

export type ValidatorEvent =
  { name: PropertyKey, type: "create" } |
  { name: PropertyKey, type: "remove" } |
  { name: PropertyKey, type: "result", result: ValidationResult | null }

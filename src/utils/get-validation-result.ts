import type { ValidationResult } from "../types"
import { pickProps } from "tstk"
import { assertIsValidationResult } from "./assert-is-validation-result"

export function getValidationResult(value: any): Readonly<ValidationResult> {
  assertIsValidationResult(value)

  const result = pickProps(value, ["state", "message", "payload"])

  return Object.freeze(result)
}

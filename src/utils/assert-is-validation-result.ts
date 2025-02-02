import type { ValidationResult } from "../types"
import { assertHasOptionalPropOfType, assertHasProp, assertHasPropOfType, assertIsType, isJSONValue } from "tstk"

export function assertIsValidationResult(value: any): asserts value is ValidationResult {
  assertIsType(value, "object", "Result must be an object")

  assertHasProp(value, "state", "Result state must be defined")

  assertHasPropOfType(value, "state", "string", "Result state must be a string")

  assertHasOptionalPropOfType(value, "message", "string", "Result message must be a string")

  assertHasOptionalPropOfType(value, "payload", isJSONValue, "Result payload must be a JSON value")
}

import type { ValidationTarget } from "../types"
import { arrayOfType, assertHasOptionalPropOfType, assertHasProp, assertHasPropOfType, assertIsType, isPropertyKey, oneOfTypes } from "tstk"

export function assertIsValidationTarget(value: any): asserts value is ValidationTarget {
  assertIsType(value, "object", "Target must be an object")

  assertHasProp(value, "fixture", "Target fixture must be defined")

  assertHasPropOfType(value, "fixture", isPropertyKey, "Target fixture must be a property key")

  assertHasOptionalPropOfType(value, "trigger", oneOfTypes("string", arrayOfType("string")), "Target trigger must be a string or string array")

  assertHasOptionalPropOfType(value, "state", oneOfTypes("string", arrayOfType("string")), "Target state must be a string or string array")
}

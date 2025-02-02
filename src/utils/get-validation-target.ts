import type { ValidationTarget } from "../types"
import { pickProps } from "tstk"
import { assertIsValidationTarget } from "./assert-is-validation-target"

export function getValidationTarget(value: any): Readonly<ValidationTarget> {
  assertIsValidationTarget(value)

  const target = pickProps(value, ["fixture", "state", "trigger"])

  return Object.freeze(target)
}

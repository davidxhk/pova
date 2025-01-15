import type { Validator, ValidatorProxy } from "../types"
import { createReadonlyProxy } from "./create-readonly-proxy"

export function createValidatorProxy(validator: Validator): ValidatorProxy {
  return createReadonlyProxy(validator, ["result", "dispatchResult"])
}

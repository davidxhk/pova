import type { ValidationResult } from "./validation-result"
import type { ValidatorProxy } from "./validator-proxy"

export interface PluginProps {
  validator: ValidatorProxy
  trigger: string | undefined
  result: ValidationResult | null
  controller: AbortController
}

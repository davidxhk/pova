import type { FixturesProxy } from "./fixtures-proxy"
import type { ValidationResult } from "./validation-result"
import type { ValidatorProxy } from "./validator-proxy"

export interface PluginProps {
  fixtures: FixturesProxy
  validator: ValidatorProxy
  trigger: string | undefined
  result: ValidationResult | null
  controller: AbortController
}

import type { PluginProps } from "./plugin-props"
import type { Promisable } from "./promisable"
import type { ValidationResult } from "./validation-result"

export type FactoryPlugin = (props: PluginProps) => Promisable<ValidationResult | boolean | void>

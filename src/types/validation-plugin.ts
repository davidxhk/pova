import type { PluginProps } from "./plugin-props"
import type { Promisable } from "./promisable"
import type { ValidationResult } from "./validation-result"

export type ValidationPlugin = (props: PluginProps) => Promisable<ValidationResult | void>

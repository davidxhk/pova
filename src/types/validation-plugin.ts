import type { Promisable } from "tstk"
import type { PluginProps } from "./plugin-props"
import type { ValidationResult } from "./validation-result"

export type ValidationPlugin = (props: PluginProps) => Promisable<ValidationResult | void>

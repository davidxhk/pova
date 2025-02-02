import type { Promisable } from "tstk"
import type { PluginProps } from "./plugin-props"
import type { ValidationResult } from "./validation-result"

export type FactoryPlugin = (props: PluginProps) => Promisable<ValidationResult | boolean | void>

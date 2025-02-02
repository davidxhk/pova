import type { PluginConfig, PluginFactoryProps, PluginRegistry, PluginRegistryLike, ValidationPlugin } from "../types"
import { isType, mapProps } from "tstk"
import { checkPreconditions } from "./check-preconditions"
import { getFactoryPlugin } from "./get-factory-plugin"
import { getValidationResult } from "./get-validation-result"
import { getValidationTarget } from "./get-validation-target"

export function createValidationPlugin<K extends keyof T, T extends PluginRegistryLike<T>>(config: PluginConfig<K, T>, registry?: PluginRegistry<T>): ValidationPlugin {
  const target = getValidationTarget(config)
  const defaultResult = getValidationResult(mapProps(config as PluginFactoryProps, { result: "state" }))
  const plugin = getFactoryPlugin(config, registry)

  return async (props) => {
    if (!checkPreconditions(props, target)) {
      return
    }

    let result = await plugin(props)
    if (!result) {
      return
    }

    if (isType(result, "boolean")) {
      result = defaultResult
    }

    return result
  }
}

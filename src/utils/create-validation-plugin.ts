import type { PluginConfig, PluginRegistry, PluginRegistryLike, ValidationPlugin } from "../types"
import { checkPreconditions } from "./check-preconditions"
import { getDefaultResult } from "./get-default-result"
import { getFactoryPlugin } from "./get-factory-plugin"
import { getValidationTarget } from "./get-validation-target"

export function createValidationPlugin<K extends keyof T, T extends PluginRegistryLike<T>>(config: PluginConfig<K, T>, registry?: PluginRegistry<T>): ValidationPlugin {
  const target = getValidationTarget(config)
  const defaultResult = getDefaultResult(config)
  const plugin = getFactoryPlugin(config, registry)

  return async (props) => {
    if (!checkPreconditions(props, target)) {
      return
    }

    let result = await plugin(props)
    if (!result) {
      return
    }

    if (typeof result === "boolean") {
      result = defaultResult
    }

    return result
  }
}

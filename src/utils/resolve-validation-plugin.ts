import type { PluginProps, ValidationPlugin, ValidationResult } from "../types"
import { AbortablePromise } from "../abortable-promise"

export function resolveValidationPlugin(plugin: ValidationPlugin, props: Omit<PluginProps, "controller">): AbortablePromise<ValidationResult | void> {
  return new AbortablePromise(async (resolve, reject, controller) => {
    try {
      const result = await plugin({ ...props, controller })
      resolve(result)
    }

    catch (error) {
      reject(error)
    }
  })
}

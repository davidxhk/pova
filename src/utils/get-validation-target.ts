import type { PluginFactoryProps, ValidationTarget } from "../types"

export function getValidationTarget(props: PluginFactoryProps): ValidationTarget {
  const { fixture, state, trigger } = props

  if (!fixture) {
    throw new Error("Target fixture must be provided")
  }

  return { fixture, state, trigger }
}

import type { PluginFactoryProps, ValidationResult } from "../types"

export function getDefaultResult(props: PluginFactoryProps): ValidationResult {
  const { result: state, message, payload } = props

  if (!state) {
    throw new Error("Default result state must be provided")
  }

  return { state, message, payload }
}

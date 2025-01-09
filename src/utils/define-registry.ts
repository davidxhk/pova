import type { PluginRegistryLike } from "../types"
import { PluginRegistry } from "../plugin-registry"

export function defineRegistry<T extends PluginRegistryLike<T>>(registry: T): PluginRegistry<T> {
  return new PluginRegistry(registry)
}

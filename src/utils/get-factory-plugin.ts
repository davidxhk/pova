import type { FactoryPlugin, PluginConfig, PluginRegistry, PluginRegistryLike } from "../types"

const DEFAULT_PLUGIN: FactoryPlugin = () => true

export function getFactoryPlugin<K extends keyof T, T extends PluginRegistryLike<T>>(config: PluginConfig<K, T>, registry?: PluginRegistry<T>): FactoryPlugin {
  const { type, ...props } = config

  if (!type) {
    return DEFAULT_PLUGIN
  }

  if (!registry) {
    throw new Error("Plugin registry must be provided if plugin config has a 'type'")
  }

  const factory = registry.getFactory(type)

  return factory(props)
}

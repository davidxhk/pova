import type { PartialFactoryProps } from "./partial-factory-props"
import type { PluginRegistryType } from "./plugin-registry-type"
import type { RegistryPluginConfig } from "./registry-plugin-config"

export type AnyRegistryPluginConfig<T extends PluginRegistryType, P extends PartialFactoryProps = {}> = { [K in keyof T]: RegistryPluginConfig<K, T, P> }[keyof T]

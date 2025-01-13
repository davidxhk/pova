import type { DefaultPluginConfig } from "./default-plugin-config"
import type { PartialFactoryProps } from "./partial-factory-props"
import type { PluginRegistryType } from "./plugin-registry-type"
import type { RegistryPluginConfig } from "./registry-plugin-config"

export type PluginConfig<K extends keyof T, T extends PluginRegistryType, P extends PartialFactoryProps = {}> = DefaultPluginConfig<P> | RegistryPluginConfig<K, T, P>

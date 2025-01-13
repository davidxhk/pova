import type { AnyRegistryPluginConfig } from "./any-registry-plugin-config"
import type { DefaultPluginConfig } from "./default-plugin-config"
import type { PartialFactoryProps } from "./partial-factory-props"
import type { PluginRegistryType } from "./plugin-registry-type"

export type AnyPluginConfig<T extends PluginRegistryType, P extends PartialFactoryProps = {}> = DefaultPluginConfig<P> | AnyRegistryPluginConfig<T, P>

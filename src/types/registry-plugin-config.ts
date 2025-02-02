import type { WithDefaults } from "tstk"
import type { GetPluginFactoryCustomProps } from "./get-plugin-factory-custom-props"
import type { PartialFactoryProps } from "./partial-factory-props"
import type { PluginFactoryProps } from "./plugin-factory-props"
import type { PluginRegistryType } from "./plugin-registry-type"

export type RegistryPluginConfig<K extends keyof T, T extends PluginRegistryType, P extends PartialFactoryProps = {}> = { type: K } & WithDefaults<PluginFactoryProps, P> & GetPluginFactoryCustomProps<T[K]>

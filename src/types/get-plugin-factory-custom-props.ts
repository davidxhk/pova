import type { PluginFactory } from "./plugin-factory"
import type { PluginFactoryProps } from "./plugin-factory-props"

export type GetPluginFactoryCustomProps<T extends PluginFactory<any>> = T extends PluginFactory<infer P> ? P extends PluginFactoryProps ? Omit<P, keyof PluginFactoryProps> : never : never

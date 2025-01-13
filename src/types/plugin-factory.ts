import type { FactoryPlugin } from "./factory-plugin"
import type { PluginFactoryProps } from "./plugin-factory-props"

export type PluginFactory<P extends PluginFactoryProps> = (props: P) => FactoryPlugin

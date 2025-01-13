import type { PluginFactory } from "./plugin-factory"

export interface PluginRegistryType { [name: PropertyKey]: PluginFactory<any> }

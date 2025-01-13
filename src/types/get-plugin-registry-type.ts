import type { PluginRegistry } from "../plugin-registry"

export type GetPluginRegistryType<R extends PluginRegistry<any>> = R extends PluginRegistry<infer T> ? T : never

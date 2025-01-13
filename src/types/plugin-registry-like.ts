import type { PluginFactory } from "./plugin-factory"

export type PluginRegistryLike<R> = { [K in keyof R]: R[K] extends PluginFactory<infer P> ? PluginFactory<P> : never }

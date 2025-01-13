import type { PluginRegistryType } from "./types"
import { $registry } from "./symbols"

export class PluginRegistry<T extends PluginRegistryType> {
  readonly [$registry]: T

  constructor(registry: T) {
    this[$registry] = registry
  }

  getFactory<K extends keyof T>(key: K): T[K] {
    if (!this.hasFactory(key)) {
      throw new Error(`Plugin '${key.toString()}' not found`)
    }

    return this[$registry][key]
  }

  hasFactory(key: PropertyKey): boolean {
    return key in this[$registry]
  }
}

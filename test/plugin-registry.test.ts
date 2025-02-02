import { beforeEach, describe, expect, it } from "vitest"
import { PluginRegistry } from "../src/plugin-registry"
import { $registry } from "../src/symbols"

describe("the PluginRegistry class", () => {
  const registry = { test: () => () => true }
  let pluginRegistry: PluginRegistry<typeof registry>

  beforeEach(() => {
    pluginRegistry = new PluginRegistry(registry)
  })

  describe("its constructor", () => {
    it("initializes with a plugin registry", () => {
      expect(pluginRegistry[$registry]).toBe(registry)
    })
  })

  describe("its getFactory method", () => {
    it("gets a factory with a factory name", () => {
      const factory = pluginRegistry.getFactory("test")

      expect(factory).toBe(registry.test)
    })

    it("throws an error if the factory name does not exist", () => {
      // @ts-expect-error factory does not exist in the plugin registry
      expect(() => pluginRegistry.getFactory("unknown")).toThrow()
    })
  })

  describe("its hasFactory method", () => {
    it("returns true if a factory exists for a factory name", () => {
      expect(pluginRegistry.hasFactory("test")).toBe(true)
    })

    it("returns false if no factory exists for the factory name", () => {
      expect(pluginRegistry.hasFactory("unknown")).toBe(false)
    })
  })
})

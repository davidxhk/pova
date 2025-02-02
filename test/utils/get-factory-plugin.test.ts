import { describe, expect, it, vi } from "vitest"
import { PluginRegistry } from "../../src/plugin-registry"
import { DEFAULT_PLUGIN, getFactoryPlugin } from "../../src/utils"

describe("the getFactoryPlugin function", () => {
  const fixture = "fixture"
  const result = "result"
  const type = "test"

  it("uses the default factory plugin if the plugin config has no 'type'", () => {
    const plugin = getFactoryPlugin({ fixture, result })

    expect(plugin).toBe(DEFAULT_PLUGIN)
  })

  it("uses a plugin factory from the plugin registry to create a factory plugin if the plugin config has a 'type'", async () => {
    const factoryPlugin = () => true
    const pluginFactory = vi.fn(() => factoryPlugin)
    const pluginRegistry = new PluginRegistry({ [type]: pluginFactory })
    const getFactory = vi.spyOn(pluginRegistry, "getFactory")

    const plugin = getFactoryPlugin({ fixture, result, type }, pluginRegistry)

    expect(getFactory).toHaveBeenCalledWith(type)
    expect(pluginFactory).toHaveBeenCalledWith({ fixture, result })
    expect(plugin).toBe(factoryPlugin)
  })

  it("throws an error if the plugin config has a 'type' but no registry is provided", () => {
    // @ts-expect-error plugin registry is missing
    expect(() => getFactoryPlugin({ fixture, result, type })).toThrow()
  })

  it("throws an error if a plugin factory for 'type' does not exist in the plugin registry", () => {
    // @ts-expect-error type does not exist in plugin registry
    expect(() => getFactoryPlugin({ fixture, result, type: "unknown" }, pluginRegistry)).toThrow()
  })
})

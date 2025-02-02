import type { Mock } from "vitest"
import type { PluginFactory, PluginProps } from "../../src/types"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { FixtureStore } from "../../src/fixture-store"
import { PluginRegistry } from "../../src/plugin-registry"
import { assertIsValidationResult, createValidationPlugin, getFactoryPlugin, getValidationResult, getValidationTarget } from "../../src/utils"

vi.mock("../../src/utils/get-validation-target", { spy: true })
vi.mock("../../src/utils/get-validation-result", { spy: true })
vi.mock("../../src/utils/get-factory-plugin", { spy: true })

describe("the createValidationPlugin function", () => {
  const fixture = "fixture"
  const result = "result"
  const type = "test"
  const value = "value"

  const fixtureStore = new FixtureStore({ [fixture]: { value } })
  const pluginProps = { fixtures: fixtureStore, result: null } as any as PluginProps

  let pluginFactory: Mock<PluginFactory<any>>
  let pluginRegistry: PluginRegistry<{ [type]: PluginFactory<any> }>

  beforeEach(() => {
    pluginFactory = vi.fn()
    pluginRegistry = new PluginRegistry({ [type]: pluginFactory })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("gets a validation target from the plugin config", () => {
    createValidationPlugin({ fixture, result })

    expect(getValidationTarget).toHaveBeenCalledOnce()
    expect(getValidationTarget).toHaveBeenCalledWith({ fixture, result })
  })

  it("gets a default result from the plugin config", () => {
    createValidationPlugin({ fixture, result })

    expect(getValidationResult).toHaveBeenCalledOnce()
    expect(getValidationResult).toHaveBeenCalledWith({ fixture, state: result })
  })

  it("gets a factory plugin from the plugin config and plugin registry", () => {
    createValidationPlugin({ fixture, result, type }, pluginRegistry)

    expect(getFactoryPlugin).toHaveBeenCalledOnce()
    expect(getFactoryPlugin).toHaveBeenCalledWith({ fixture, result, type }, pluginRegistry)
  })

  it("returns a validation plugin", async () => {
    const plugin = createValidationPlugin({ fixture, result })

    expect(plugin).toEqual(expect.any(Function))

    const promise = plugin(pluginProps)
    expect(promise).toEqual(expect.any(Promise))
    await expect(promise).resolves.toSatisfy((value) => {
      assertIsValidationResult(value)
      return true
    })
  })

  describe("the validation plugin", () => {
    it("exits immediately if all precondition checks fail", async () => {
      // TODO
      // const pluginFactoryMock = vi.fn().mockReturnValue(async () => true)
      // const registryMock = {
      //   getFactory: vi.fn().mockReturnValue(pluginFactoryMock),
      // }

      // const config = {
      //   type: "test-plugin",
      //   fixture: "some-fixture",
      //   state: "FAIL",
      //   message: "Preconditions not met",
      // }

      // const validationPlugin = createValidationPlugin(config as any, registryMock as any)

      // // Force preconditions to fail
      // ;(checkPreconditions as vi.Mock).mockReturnValue(false)

      // const result = await validationPlugin({})

      // // The plugin should never be called because preconditions failed
      // expect(pluginFactoryMock).not.toHaveBeenCalled()
      // // No result (undefined) should be returned
      // expect(result).toBeUndefined()
    })

    it("runs the factory plugin if all precondition checks pass", async () => {
      // TODO
      // const pluginFactoryMock = vi.fn().mockReturnValue(async () => true)
      // const registryMock = {
      //   getFactory: vi.fn().mockReturnValue(pluginFactoryMock),
      // }

      // const config = {
      //   type: "test-plugin",
      //   fixture: "some-fixture",
      //   state: "FAIL",
      //   message: "Preconditions not met",
      // }

      // const validationPlugin = createValidationPlugin(config as any, registryMock as any)

      // // Force preconditions to fail
      // ;(checkPreconditions as vi.Mock).mockReturnValue(false)

      // const result = await validationPlugin({})

      // // The plugin should never be called because preconditions failed
      // expect(pluginFactoryMock).not.toHaveBeenCalled()
      // // No result (undefined) should be returned
      // expect(result).toBeUndefined()
    })

    it("exits if the factory plugin returns a falsy value", async () => {
      // TODO
      // const pluginFactoryMock = vi.fn().mockReturnValue(async () => false)
      // const registryMock = {
      //   getFactory: vi.fn().mockReturnValue(pluginFactoryMock),
      // }

      // const config = {
      //   type: "test-plugin",
      //   fixture: "some-fixture",
      //   state: "OK",
      // }

      // const validationPlugin = createValidationPlugin(config as any, registryMock as any)

      // ;(checkPreconditions as vi.Mock).mockReturnValue(true)

      // const result = await validationPlugin({})
      // expect(result).toBeUndefined()
    })

    it("returns the factory plugin result if it is not a boolean", async () => {
      // TODO
      // const expectedCustomResult = {
      //   state: "CUSTOM",
      //   message: "Plugin says hi",
      //   payload: { data: 123 },
      // }

      // const pluginFactoryMock = vi
      //   .fn()
      //   .mockReturnValue(async () => expectedCustomResult)

      // const registryMock = {
      //   getFactory: vi.fn().mockReturnValue(pluginFactoryMock),
      // }

      // const config = {
      //   type: "test-plugin",
      //   fixture: "some-fixture",
      //   state: "DEFAULT_OK",
      //   message: "Default message",
      //   payload: { defaultData: 999 },
      // }

      // const validationPlugin = createValidationPlugin(config as any, registryMock as any)

      // ;(checkPreconditions as vi.Mock).mockReturnValue(true)

      // const result = await validationPlugin({})
      // expect(result).toEqual(expectedCustomResult)
    })

    it("returns the default result if the factory plugin returns true", async () => {
      // TODO
      // const expectedCustomResult = {
      //   state: "CUSTOM",
      //   message: "Plugin says hi",
      //   payload: { data: 123 },
      // }

      // const pluginFactoryMock = vi
      //   .fn()
      //   .mockReturnValue(async () => expectedCustomResult)

      // const registryMock = {
      //   getFactory: vi.fn().mockReturnValue(pluginFactoryMock),
      // }

      // const config = {
      //   type: "test-plugin",
      //   fixture: "some-fixture",
      //   state: "DEFAULT_OK",
      //   message: "Default message",
      //   payload: { defaultData: 999 },
      // }

      // const validationPlugin = createValidationPlugin(config as any, registryMock as any)

      // ;(checkPreconditions as vi.Mock).mockReturnValue(true)

      // const result = await validationPlugin({})
      // expect(result).toEqual(expectedCustomResult)
    })
  })

  it("throws an error if the plugin config is missing a target fixture", () => {
    // @ts-expect-error fixture is missing
    expect(() => createValidationPlugin({ result })).toThrow()
  })

  it("throws an error if the plugin config is missing a default result state", () => {
    // @ts-expect-error result is missing
    expect(() => createValidationPlugin({ fixture })).toThrow()
  })
})

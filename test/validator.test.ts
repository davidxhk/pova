import type { Mock, MockInstance } from "vitest"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AbortablePromise } from "../src/abortable-promise"
import { FixtureStore } from "../src/fixture-store"
import { PluginRegistry } from "../src/plugin-registry"
import { $fixtures, $plugins, $promise, $props, $result, $validators } from "../src/symbols"
import { createFixturesProxy, createReadonlyProxy, createValidationPlugin, createValidatorProxy, handleValidationError, resolveValidationPlugin } from "../src/utils"
import { Validator } from "../src/validator"

vi.mock("../src/utils", { spy: true })

describe("the Validator class", () => {
  let fixtureStore: FixtureStore
  let validator: Validator
  let listener: Mock<EventListener>

  beforeEach(() => {
    fixtureStore = new FixtureStore()
    validator = new Validator(fixtureStore)
    listener = vi.fn()
    validator.addEventListener("validation", listener)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("its constructor", () => {
    it("initializes with a fixture store", () => {
      expect(validator[$fixtures]).toBe(fixtureStore)
    })

    it("initializes with empty default props", () => {
      expect(validator[$props]).toEqual({})
    })

    it("initializes with an empty plugins array", () => {
      expect(validator[$plugins]).toEqual([])
    })

    it("initializes with a null promise", () => {
      expect(validator[$promise]).toBeNull()
    })

    it("initializes with a null result", () => {
      expect(validator[$result]).toBeNull()
    })

    it("accepts custom default props", () => {
      const defaultProps = {}

      validator = new Validator(fixtureStore, defaultProps)

      expect(validator[$props]).toBe(defaultProps)
    })
  })

  describe("its addPlugin method", () => {
    const fixture = "fixture"
    const result = "result"
    const type = "test"
    const pluginRegistry = new PluginRegistry({ [type]: () => () => true })

    it("creates a validation plugin with a plugin config", () => {
      validator.addPlugin({ fixture, result })

      expect(createValidationPlugin).toHaveBeenCalledWith({ fixture, result }, undefined)
    })

    it("accepts a plugin config with a 'type' and a plugin registry", () => {
      validator.addPlugin({ fixture, result, type }, pluginRegistry)

      expect(createValidationPlugin).toHaveBeenCalledWith({ fixture, result, type }, pluginRegistry)
    })

    it("merges a plugin config with its default props", () => {
      const validator = new Validator(fixtureStore, { fixture })

      validator.addPlugin({ result })

      expect(createValidationPlugin).toHaveBeenCalledWith({ fixture, result }, undefined)
    })

    it("adds the validation plugin to its plugins array", () => {
      const plugin = () => {}
      vi.mocked(createValidationPlugin).mockReturnValueOnce(plugin)

      validator.addPlugin({ fixture, result })

      expect(validator[$plugins]).toContain(plugin)
    })

    it("adds itself to the validators array for the target fixture", () => {
      validator.addPlugin({ fixture, result })

      expect(fixtureStore[$validators][fixture]).toContain(validator)
    })
  })

  describe("its addPlugins method", () => {
    const fixture = "fixture"
    const result = "result"
    const type = "test"
    const pluginRegistry = new PluginRegistry({ [type]: () => () => true })
    let addPlugin: MockInstance<Validator["addPlugin"]>

    beforeEach(() => {
      addPlugin = vi.spyOn(validator, "addPlugin")
    })

    it("adds a plugin for each config", () => {
      validator.addPlugins([{ fixture, result }], pluginRegistry)

      expect(addPlugin).toHaveBeenCalledWith({ fixture, result }, pluginRegistry)
    })

    it("uses the plugin registry if a config has a 'type'", () => {
      validator.addPlugins([{ fixture, result, type }], pluginRegistry)

      expect(addPlugin).toHaveBeenCalledWith({ fixture, result, type }, pluginRegistry)
    })

    it("accepts custom default props", () => {
      validator.addPlugins([{ result, type }], pluginRegistry, { fixture })

      expect(addPlugin).toHaveBeenCalledWith({ fixture, result, type }, pluginRegistry)
    })
  })

  describe("its abort method", () => {
    let abort: MockInstance<AbortablePromise<void>["abort"]>

    beforeEach(() => {
      const promise = new AbortablePromise<void>(() => {})
      validator[$promise] = promise
      abort = vi.spyOn(promise, "abort")
      promise.catch(() => null)
    })

    it("aborts any existing promise", () => {
      validator.abort()

      expect(abort).toHaveBeenCalled()
    })

    it("accepts a custom reason", () => {
      validator.abort("test")

      expect(abort).toHaveBeenCalledWith("test")
    })
  })

  describe("its reset method", () => {
    it("aborts any existing promise", () => {
      const abort = vi.spyOn(validator, "abort")

      validator.reset()

      expect(abort).toHaveBeenCalledOnce()
    })

    it("dispatches a null result", () => {
      const dispatchResult = vi.spyOn(validator, "dispatchResult")

      validator.reset()

      expect(dispatchResult).toHaveBeenCalledWith(null)
    })
  })

  describe("its result getter", () => {
    it("returns a readonly clone of its current result", () => {
      const initial = { state: "initial" }
      validator[$result] = initial

      const result = validator.result

      expect(createReadonlyProxy).toHaveBeenCalledWith(initial)
      const proxy = vi.mocked(createReadonlyProxy).mock.results[0].value
      expect(result).toBe(proxy)
    })

    it("returns null if no result exists", () => {
      expect(validator.result).toBeNull()
    })
  })

  describe("its dispatchResult method", () => {
    const result = { state: "valid" }

    it("updates its current result", () => {
      validator.dispatchResult(result)

      expect(validator[$result]).toBe(result)
    })

    it("dispatches a validation event", () => {
      validator.dispatchResult(result)

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: result }))
    })
  })

  describe("its validate method", () => {
    const results = [{ state: "invalid" }, undefined, { state: "valid" }, undefined]
    const plugins = results.map(result => () => Promise.resolve(result))

    beforeEach(() => {
      validator[$plugins].push(...plugins)
    })

    it("aborts any existing promise", async () => {
      const abort = vi.spyOn(validator, "abort")

      validator.validate()

      expect(abort).toHaveBeenCalledOnce()
    })

    describe("resolves each plugin in its plugins array", () => {
      const initial = { state: "initial" }
      const trigger = "trigger"

      beforeEach(async () => {
        validator[$result] = initial
        await validator.validate(trigger)
      })

      it("with a readonly proxy of its fixture store", async () => {
        expect(createFixturesProxy).toHaveBeenCalledOnce()
        expect(createFixturesProxy).toHaveBeenCalledWith(fixtureStore)
        const proxy = vi.mocked(createFixturesProxy).mock.results[0].value

        plugins.forEach(plugin => expect(resolveValidationPlugin).toHaveBeenCalledWith(plugin, expect.objectContaining({ fixtures: proxy })))
      })

      it("with a readonly proxy of itself", async () => {
        expect(createValidatorProxy).toHaveBeenCalledOnce()
        expect(createValidatorProxy).toHaveBeenCalledWith(validator)
        const proxy = vi.mocked(createValidatorProxy).mock.results[0].value

        plugins.forEach(plugin => expect(resolveValidationPlugin).toHaveBeenCalledWith(plugin, expect.objectContaining({ validator: proxy })))
      })

      it("with the validation trigger", async () => {
        plugins.forEach(plugin => expect(resolveValidationPlugin).toHaveBeenCalledWith(plugin, expect.objectContaining({ trigger })))
      })

      it("with the last returned/current result", async () => {
        expect(resolveValidationPlugin).toHaveBeenCalledWith(plugins[0], expect.objectContaining({ result: initial }))
        expect(resolveValidationPlugin).toHaveBeenCalledWith(plugins[1], expect.objectContaining({ result: results[0] }))
        expect(resolveValidationPlugin).toHaveBeenCalledWith(plugins[2], expect.objectContaining({ result: results[0] }))
        expect(resolveValidationPlugin).toHaveBeenCalledWith(plugins[3], expect.objectContaining({ result: results[2] }))
      })
    })

    it("stores an abortable promise when resolving each plugin", () => {
      validator.validate()

      expect(validator[$promise]).toBeInstanceOf(AbortablePromise)
    })

    it("handles validation errors", async () => {
      const error = new Error("test")
      validator[$plugins].push(() => Promise.reject(error))

      await validator.validate()

      expect(handleValidationError).toHaveBeenCalledWith(error)
    })

    it("dispatches the last returned result", async () => {
      const dispatchResult = vi.spyOn(validator, "dispatchResult")

      await validator.validate()

      expect(dispatchResult).toHaveBeenCalledOnce()
      expect(dispatchResult).toHaveBeenCalledWith(results[2])
    })

    it("returns the last returned result", async () => {
      const result = await validator.validate()

      expect(result).toBe(results[2])
    })
  })
})

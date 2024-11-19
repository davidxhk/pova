import type { ValidationFixture, ValidationResult } from "../src/validator"

import { beforeEach, describe, expect, it, vi } from "vitest"
import { AbortablePromise } from "../src/utils"
import { Validator } from "../src/validator"

describe("class Validator", () => {
  let validator: Validator

  beforeEach(() => {
    validator = new Validator()
  })

  describe("constructor", () => {
    it("uses the specified fixtures list when provided", () => {
      const fixtures = []

      validator = new Validator(fixtures)

      expect(validator.fixtures).toBe(fixtures)
    })

    it("uses the specified plugins list when provided", () => {
      const plugins = []

      validator = new Validator(undefined, plugins)

      expect(validator.plugins).toBe(plugins)
    })

    it("initializes with a null result and a null promise", () => {
      expect(validator.result).toBeNull()
      expect(validator.promise).toBeNull()
    })
  })

  describe("addFixture", () => {
    it("adds a fixture to the fixtures list", () => {
      const fixture: ValidationFixture = { name: "email", value: "test@example.com" }

      validator.addFixture(fixture)

      expect(validator.fixtures).toContain(fixture)
    })
  })

  describe("findFixture", () => {
    it("finds a fixture by name when a string is provided", () => {
      const fixture: ValidationFixture = { name: "email", value: "test@example.com" }
      validator.addFixture(fixture)

      const result = validator.findFixture("email")

      expect(result).toEqual(fixture)
    })

    it("finds a fixture by index when a number is provided", () => {
      const fixture: ValidationFixture = { name: "email", value: "test@example.com" }
      validator.addFixture(fixture)

      const result = validator.findFixture(0)

      expect(result).toEqual(fixture)
    })

    it("returns undefined when a fixture is not found", () => {
      const result = validator.findFixture(-1)

      expect(result).toBeUndefined()
    })
  })

  describe("removeFixture", () => {
    it("removes a fixture from the fixtures list by name", () => {
      const fixture: ValidationFixture = { name: "email", value: "test@example.com" }
      validator.addFixture(fixture)

      validator.removeFixture("email")

      expect(validator.fixtures).not.toContain(fixture)
    })

    it("removes a fixture from the fixtures list by index", () => {
      const fixture: ValidationFixture = { name: "email", value: "test@example.com" }
      validator.addFixture(fixture)

      validator.removeFixture(0)

      expect(validator.fixtures).not.toContain(fixture)
    })

    it("removes a fixture from the fixtures list by reference", () => {
      const fixture: ValidationFixture = { name: "email", value: "test@example.com" }
      validator.addFixture(fixture)

      validator.removeFixture(fixture)

      expect(validator.fixtures).not.toContain(fixture)
    })
  })

  describe("addPlugin", () => {
    it("adds a plugin to the plugins list", () => {
      const plugin = () => {}

      validator.addPlugin(plugin)

      expect(validator.plugins).toContain(plugin)
    })
  })

  describe("removePlugin", () => {
    it("removes a plugin from the plugins list", () => {
      const plugin = () => {}
      validator.addPlugin(plugin)

      validator.removePlugin(plugin)

      expect(validator.plugins).not.toContain(plugin)
    })
  })

  describe("setResult", () => {
    it("updates the result and dispatches a validation event", () => {
      const listener = vi.fn()
      validator.addEventListener("validation", listener)
      const result: ValidationResult = { state: "valid" }

      validator.setResult(result)

      expect(validator.result).toBe(result)
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: result }))
    })
  })

  describe("reset", () => {
    it("aborts any currently running plugin", async () => {
      validator.addPlugin(() => new Promise(resolve => setTimeout(resolve, 10)))
      validator.validate()
      const signal = validator.promise!.signal

      validator.reset()

      expect(signal.aborted).toBe(true)
    })

    it("sets a null result and dispatches a validation event", () => {
      const listener = vi.fn()
      validator.addEventListener("validation", listener)

      validator.reset()

      expect(validator.result).toBeNull()
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: null }))
    })
  })

  describe("async validate", () => {
    it("aborts any currently running plugin", async () => {
      validator.addPlugin(() => new Promise(resolve => setTimeout(resolve, 10)))
      validator.validate()
      const signal = validator.promise!.signal

      validator.validate()

      expect(signal.aborted).toBe(true)
    })

    it("resolves all plugins sequentially", async () => {
      const plugins = Array.from([() => {}, () => {}, () => {}], vi.fn)
      plugins.forEach(plugin => validator.addPlugin(plugin))

      await validator.validate()

      plugins.forEach(plugin => expect(plugin).toHaveBeenCalledOnce())
    })

    it("resolves each plugin using an abortable promise", async () => {
      validator.addPlugin(() => new Promise(resolve => setTimeout(resolve, 10)))

      validator.validate()

      expect(validator.promise).toStrictEqual(expect.any(AbortablePromise))
    })

    it("passes the validator, trigger, a result, and an abort signal into each plugin", async () => {
      const plugins = Array.from([() => {}, () => {}, () => {}], vi.fn)
      plugins.forEach(plugin => validator.addPlugin(plugin))
      const trigger = "test"

      await validator.validate(trigger)

      plugins.forEach(plugin => expect(plugin).toHaveBeenCalledWith(validator, trigger, expect.any(Object), expect.any(AbortSignal)))
    })

    it("passes a null result into the first plugin if a result has not been dispatched", async () => {
      const plugin = vi.fn(() => {})
      validator.addPlugin(plugin)

      await validator.validate()

      expect(plugin).toHaveBeenCalledWith(validator, undefined, null, expect.any(AbortSignal))
    })

    it("passes the result that was last dispatched into the first plugin", async () => {
      validator.setResult({ state: "initial" })
      const plugin = vi.fn(() => {})
      validator.addPlugin(plugin)

      await validator.validate()

      expect(plugin).toHaveBeenCalledWith(validator, undefined, { state: "initial" }, expect.any(AbortSignal))
    })

    it("passes the result that was last returned into the second plugin onwards", async () => {
      const plugins = Array.from([
        () => ({ state: "first" }),
        () => {},
        () => ({ state: "third" }),
        () => {},
        () => {},
        () => ({ state: "sixth" }),
        () => {},
      ], vi.fn)
      plugins.forEach(plugin => validator.addPlugin(plugin))

      await validator.validate()

      const expected = [
        null,
        { state: "first" },
        { state: "first" },
        { state: "third" },
        { state: "third" },
        { state: "third" },
        { state: "sixth" },
      ]
      plugins.forEach((plugin, index) => expect(plugin).toHaveBeenCalledWith(validator, undefined, expected[index], expect.any(AbortSignal)))
    })

    it("dispatches and returns the result that was last returned", async () => {
      const plugins = [
        () => ({ state: "first" }),
        () => {},
        () => ({ state: "third" }),
        () => {},
        () => {},
        () => ({ state: "sixth" }),
        () => {},
      ]
      plugins.forEach(plugin => validator.addPlugin(plugin))
      const listener = vi.fn()
      validator.addEventListener("validation", listener)

      const result = await validator.validate()

      expect(result).toMatchObject({ state: "sixth" })
      expect(validator.result).toBe(result)
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: result }))
    })

    it("returns a result with an aborted state when a plugin is aborted", async () => {
      validator.addPlugin(() => new Promise(resolve => setTimeout(resolve, 10)))
      const validation = validator.validate()
      validator.validate()

      const result = await validation

      expect(result).toMatchObject({ state: "aborted" })
    })

    it("returns a result with an error state when a plugin throws an error", async () => {
      validator.addPlugin(() => {
        throw new Error("test")
      })

      const result = await validator.validate()

      expect(result).toMatchObject({ state: "error" })
    })

    it("returns a result with an unknown state when a plugin throws a non-error", async () => {
      validator.addPlugin(() => {
        // eslint-disable-next-line no-throw-literal
        throw "test"
      })

      const result = await validator.validate()

      expect(result).toMatchObject({ state: "unknown" })
    })
  })
})

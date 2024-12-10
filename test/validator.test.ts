import { beforeEach, describe, expect, it, vi } from "vitest"
import { AbortablePromise } from "../src/abortable-promise"
import { $fixtures, $plugins, $promise, $proxy, $result } from "../src/symbols"
import { Validator } from "../src/validator"

describe("class Validator", () => {
  let validator: Validator
  let listener: ReturnType<typeof vi.fn>

  beforeEach(() => {
    validator = new Validator()
    listener = vi.fn()
    validator.addEventListener("validation", listener)
  })

  describe("supports", () => {
    let validator: Validator
    let listener: ReturnType<typeof vi.fn>

    beforeEach(() => {
      validator = new Validator()
      listener = vi.fn()
      validator.addEventListener("validation", listener)
    })

    it("using a plugin with one fixture", async () => {
      const result = { state: "invalid", message: "Missing email" }
      validator.addPlugin(({ validator }) => {
        const { value } = validator.getFixture("email")
        if (!value) {
          return result
        }
      })
      validator.addFixture({ name: "email", value: "" })

      await validator.validate()

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: result }))
    })

    it("using a plugin with multiple fixtures", async () => {
      const result = { state: "invalid", message: "Passwords do not match" }
      validator.addPlugin(({ validator }) => {
        const { value } = validator.getFixture("password")
        const { value: matchValue } = validator.getFixture("reenter-password")
        if (value !== matchValue) {
          return result
        }
      })
      validator.addFixture({ name: "password", value: "abc" })
      validator.addFixture({ name: "reenter-password", value: "abcd" })

      await validator.validate()

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: result }))
    })

    it("using an async plugin", async () => {
      validator.addPlugin(() => new Promise(resolve => setTimeout(resolve, 10)))

      await validator.validate()

      expect(listener).toHaveBeenCalledOnce()
    })

    it("aborting an async plugin", () => {
      validator.addPlugin(() => new Promise(resolve => setTimeout(resolve, 10)))
      validator.validate()

      validator.abort()

      expect(listener).not.toHaveBeenCalled()
    })

    it("debouncing an async plugin", async () => {
      validator.addPlugin(() => new Promise(resolve => setTimeout(resolve, 10)))
      validator.validate()

      await validator.validate()

      expect(listener).toHaveBeenCalledOnce()
    })

    it("dispatching an intermediate result in a plugin", async () => {
      const result = { state: "pending" }
      validator.addPlugin(({ validator }) => validator.dispatchResult(result))

      await validator.validate()

      expect(listener).toHaveBeenCalledTimes(2)
      expect(listener).toHaveBeenNthCalledWith(1, expect.objectContaining({ detail: result }))
      expect(listener).toHaveBeenNthCalledWith(2, expect.objectContaining({ detail: null }))
    })

    it("aborting the validation process in a plugin", async () => {
      validator.addPlugin(async ({ controller }) => controller.abort())

      await validator.validate()

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe("its constructor", () => {
    it("initializes with a masked readonly proxy of itself", () => {
      expect(validator[$proxy]).toMatchObject(validator)
      expect(validator[$proxy]).not.toBe(validator)
    })

    it("initializes with an empty fixtures object", () => {
      expect(validator[$fixtures]).toEqual({})
    })

    it("initializes with a given fixtures object if one is provided", () => {
      const fixtures = {}

      validator = new Validator(fixtures)

      expect(validator[$fixtures]).toBe(fixtures)
    })

    it("initializes with an empty plugins list", () => {
      expect(validator[$plugins]).toEqual(expect.any(Array))
      expect(validator[$plugins]).toHaveLength(0)
    })

    it("initializes with a given plugins list if one is provided", () => {
      const plugins = []

      validator = new Validator(undefined, plugins)

      expect(validator[$plugins]).toBe(plugins)
    })

    it("initializes with a null promise", () => {
      expect(validator[$promise]).toBeNull()
    })

    it("initializes with a null result", () => {
      expect(validator[$result]).toBeNull()
    })
  })

  describe("its result getter", () => {
    it("returns null if no result exists", () => {
      expect(validator.result).toBeNull()
    })

    it("returns a frozen clone of its result if one exists", () => {
      const result = { state: "initial" }
      validator.dispatchResult(result)

      const actual = validator.result
      if (!actual) {
        expect.unreachable("Result should not be null")
      }

      expect(actual).not.toBe(result)
      expect(actual).toMatchObject(result)
      expect(() => (actual.state = "test")).toThrow(TypeError)
    })
  })

  describe("its addFixture method", () => {
    it("adds a fixture to its fixtures object by their name", () => {
      const fixture = { name: "email", value: "test@example.com" }

      validator.addFixture(fixture)

      expect(validator[$fixtures][fixture.name]).toBe(fixture)
    })

    it("uses a given name if one is provided", () => {
      const fixture = { name: "email", value: "test@example.com" }

      validator.addFixture(fixture, "test")

      expect(validator[$fixtures].test).toBe(fixture)
    })

    it("throws an error if no name is provided", () => {
      const fixture = { value: "test@example.com" }

      expect(() => validator.addFixture(fixture)).toThrow()
    })

    it("throws an error if given a name that is not a string", () => {
      const fixture = { name: 1, value: "test" }

      expect(() => validator.addFixture(fixture)).toThrow(TypeError)
    })

    it("throws an error if a fixture already exists for a given name", () => {
      validator = new Validator({ email: { value: "test@example.com" } })
      const fixture = { name: "email", value: "test@example.com" }

      expect(() => validator.addFixture(fixture)).toThrow()
    })
  })

  describe("its hasFixture method", () => {
    it("returns true if a fixture exists for a given name", () => {
      const fixture = { name: "email", value: "test@example.com" }
      validator.addFixture(fixture)

      const result = validator.hasFixture("email")

      expect(result).toBe(true)
    })

    it("returns false if a fixture does not exist for a given name", () => {
      const result = validator.hasFixture("email")

      expect(result).toBe(false)
    })
  })

  describe("its findFixture method", () => {
    it("finds a fixture in its fixtures object by name", () => {
      const fixture = { name: "email", value: "test@example.com" }
      validator.addFixture(fixture)

      const result = validator.findFixture("email")

      expect(result).toBe(fixture)
    })

    it("returns undefined if a fixture is not found", () => {
      const result = validator.findFixture("unknown")

      expect(result).toBeUndefined()
    })
  })

  describe("its getFixture method", () => {
    it("gets a fixture in its fixtures object by name", () => {
      const fixture = { name: "email", value: "test@example.com" }
      validator.addFixture(fixture)

      const result = validator.getFixture("email")

      expect(result).toBe(fixture)
    })

    it("checks if a fixture matches a primitive type if one is provided", () => {
      const fixture = 1
      validator.addFixture(fixture, "test")

      const result = validator.getFixture("test", { type: "number" })

      expect(result).toBeTypeOf("number")
      expect(result).toBe(fixture)
    })

    it("checks if a fixture is an instance of a class if one is provided", () => {
      class TestClass {}
      const fixture = new TestClass()
      validator.addFixture(fixture, "test")

      const result = validator.getFixture("test", { type: TestClass })

      expect(result).toBeInstanceOf(TestClass)
      expect(result).toBe(fixture)
    })

    it("throws an error if a fixture does not match a given primitive type", () => {
      const fixture = 1
      validator.addFixture(fixture, "test")

      expect(() => validator.getFixture("test", { type: "string" })).toThrow(TypeError)
    })

    it("throws an error if a fixture is not an instance of a given class", () => {
      class TestClass {}
      class AnotherClass {}
      const fixture = new TestClass()
      validator.addFixture(fixture, "test")

      expect(() => validator.getFixture("test", { type: AnotherClass })).toThrow(TypeError)
    })

    it("throws an error if a fixture is not found", () => {
      expect(() => validator.getFixture("unknown")).toThrow()
    })
  })

  describe("its getFixtureValue method", () => {
    it("gets the value of a fixture in its fixtures object by name", () => {
      const fixture = { name: "email", value: "test@example.com" }
      validator.addFixture(fixture)

      const result = validator.getFixtureValue("email")

      expect(result).toBe(fixture.value)
    })

    it("uses a given key if one is provided", () => {
      const fixture = { name: "email", email: "test@example.com" }
      validator.addFixture(fixture)

      const result = validator.getFixtureValue("email", { key: "email" })

      expect(result).toBe(fixture.email)
    })

    it("checks if a fixture value matches a primitive type if one is provided", () => {
      const fixture = { name: "test", value: 1 }
      validator.addFixture(fixture)

      const result = validator.getFixtureValue("test", { type: "number" })

      expect(result).toBeTypeOf("number")
      expect(result).toBe(fixture.value)
    })

    it("checks if a fixture value is an instance of a class if one is provided", () => {
      class TestClass {}
      const fixture = { name: "test", value: new TestClass() }
      validator.addFixture(fixture)

      const result = validator.getFixtureValue("test", { type: TestClass })

      expect(result).toBeInstanceOf(TestClass)
      expect(result).toBe(fixture.value)
    })

    it("throws an error if a fixture value does not match a given primitive type", () => {
      const fixture = { name: "test", value: 1 }
      validator.addFixture(fixture)

      expect(() => validator.getFixtureValue("test", { type: "string" })).toThrow(TypeError)
    })

    it("throws an error if a fixture value is not an instance of a given class", () => {
      class TestClass {}
      class AnotherClass {}
      const fixture = { name: "test", value: new TestClass() }
      validator.addFixture(fixture)

      expect(() => validator.getFixtureValue("test", { type: AnotherClass })).toThrow(TypeError)
    })

    it("throws an error if a fixture value is not found", () => {
      const fixture = 1
      validator.addFixture(fixture, "test")

      expect(() => validator.getFixtureValue("test")).toThrow()
    })

    it("throws an error if a fixture is not found", () => {
      expect(() => validator.getFixtureValue("unknown")).toThrow()
    })
  })

  describe("its removeFixture method", () => {
    it("removes a fixture from its fixtures object by name", () => {
      const fixture = { name: "email", value: "test@example.com" }
      validator.addFixture(fixture)

      validator.removeFixture("email")

      expect(validator[$fixtures].email).toBeUndefined()
    })

    it("removes a fixture from its fixtures object by reference", () => {
      const fixture = { name: "email", value: "test@example.com" }
      validator.addFixture(fixture)

      validator.removeFixture(fixture)

      expect(validator[$fixtures].email).toBeUndefined()
    })
  })

  describe("its addPlugin method", () => {
    it("adds a plugin to its plugins list", () => {
      const plugin = () => {}

      validator.addPlugin(plugin)

      expect(validator[$plugins]).toContain(plugin)
    })
  })

  describe("its removePlugin method", () => {
    it("removes a plugin from its plugins list by reference", () => {
      const plugin = () => {}
      validator.addPlugin(plugin)

      validator.removePlugin(plugin)

      expect(validator[$plugins]).not.toContain(plugin)
    })
  })

  describe("its dispatchResult method", () => {
    it("updates its result", () => {
      const result = { state: "valid" }

      validator.dispatchResult(result)

      expect(validator[$result]).toBe(result)
    })

    it("dispatches a validation event", () => {
      const result = { state: "valid" }

      validator.dispatchResult(result)

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: result }))
    })
  })

  describe("its abort method", () => {
    it("aborts any currently running plugin", () => {
      validator.addPlugin(() => new Promise(resolve => setTimeout(resolve, 10)))
      validator.validate()
      const promise = validator[$promise]
      if (!promise) {
        expect.unreachable("Promise should be defined")
      }

      validator.abort()

      expect(promise.signal.aborted).toBe(true)
    })

    it("uses a given reason if one is provided", () => {
      validator.addPlugin(() => new Promise(resolve => setTimeout(resolve, 10)))
      validator.validate()
      const promise = validator[$promise]
      if (!promise) {
        expect.unreachable("Promise should be defined")
      }
      const reason = "test"

      validator.abort(reason)

      expect(promise.signal.reason).toBe(reason)
    })
  })

  describe("its reset method", () => {
    it("aborts any currently running plugin", () => {
      validator.addPlugin(() => new Promise(resolve => setTimeout(resolve, 10)))
      validator.validate()
      const promise = validator[$promise]
      if (!promise) {
        expect.unreachable("Promise should be defined")
      }

      validator.reset()

      expect(promise.signal.aborted).toBe(true)
    })

    it("dispatches a null result", () => {
      validator.reset()

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: null }))
    })
  })

  describe("its validate method", () => {
    const results = [{ state: "first" }, undefined, { state: "third" }, undefined]

    it("aborts any currently running plugin", () => {
      validator.addPlugin(() => new Promise(resolve => setTimeout(resolve, 10)))
      validator.validate()
      const promise = validator[$promise]
      if (!promise) {
        expect.unreachable("Promise should be defined")
      }

      validator.validate()

      expect(promise.signal.aborted).toBe(true)
    })

    it("resolves all plugins in its plugins list", async () => {
      const plugins = Array.from({ length: 2 }, () => vi.fn())
      plugins.forEach(plugin => validator.addPlugin(plugin))

      await validator.validate()

      plugins.forEach(plugin => expect(plugin).toHaveBeenCalledOnce())
    })

    it("resolves a plugin using an abortable promise", () => {
      validator.addPlugin(() => new Promise(resolve => setTimeout(resolve, 10)))

      validator.validate()

      expect(validator[$promise]).toEqual(expect.any(AbortablePromise))
    })

    it("passes its readonly proxy into a plugin", async () => {
      const plugin = vi.fn()
      validator.addPlugin(plugin)

      await validator.validate()

      expect(plugin).toHaveBeenCalledWith(expect.objectContaining({ validator: validator[$proxy] }))
    })

    it("passes an abort controller into a plugin", async () => {
      const plugin = vi.fn()
      validator.addPlugin(plugin)

      await validator.validate()

      expect(plugin).toHaveBeenCalledWith(expect.objectContaining({ controller: expect.any(AbortController) }))
    })

    it("passes the trigger into a plugin", async () => {
      const plugin = vi.fn()
      validator.addPlugin(plugin)
      const trigger = "test"

      await validator.validate(trigger)

      expect(plugin).toHaveBeenCalledWith(expect.objectContaining({ trigger }))
    })

    it("passes its current result into the first plugin", async () => {
      const plugin = vi.fn()
      validator.addPlugin(plugin)

      await validator.validate()

      expect(plugin).toHaveBeenCalledWith(expect.objectContaining({ result: null }))

      const result = { state: "initial" }
      validator.dispatchResult(result)

      await validator.validate()

      expect(plugin).toHaveBeenCalledWith(expect.objectContaining({ result }))
    })

    it("passes the last returned result into the second plugin onwards", async () => {
      const plugins = Array.from(results, result => vi.fn(() => result))
      plugins.forEach(plugin => validator.addPlugin(plugin))

      await validator.validate()

      const expected = [null, results[0], results[0], results[2]]
      plugins.forEach((plugin, index) => expect(plugin).toHaveBeenCalledWith(expect.objectContaining({ result: expected[index] })))
    })

    it("dispatches the last returned result", async () => {
      results.forEach(result => validator.addPlugin(() => result))

      await validator.validate()

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: results[2] }))
    })

    it("returns the last returned result", async () => {
      results.forEach(result => validator.addPlugin(() => result))

      const result = await validator.validate()

      expect(result).toBe(results[2])
    })

    it("returns a result with an aborted state if a plugin is aborted", async () => {
      validator.addPlugin(() => new Promise(resolve => setTimeout(resolve, 10)))

      const resultPromise = validator.validate()

      validator.abort()
      const result = await resultPromise
      expect(result).toMatchObject({ state: "aborted" })
    })

    it("returns a result with an error state if a plugin throws an error object", async () => {
      validator.addPlugin(() => {
        throw new Error("test")
      })

      const result = await validator.validate()

      expect(result).toMatchObject({ state: "error" })
    })

    it("returns a result with an unknown state if a plugin throws an object that is not an error", async () => {
      validator.addPlugin(() => {
        // eslint-disable-next-line no-throw-literal
        throw 1
      })

      const result = await validator.validate()

      expect(result).toMatchObject({ state: "unknown" })
    })
  })
})

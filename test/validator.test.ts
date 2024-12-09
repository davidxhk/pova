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

  describe("constructor", () => {
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

  describe("get result", () => {
    it("returns null if no result exists", () => {
      expect(validator.result).toBeNull()
    })

    it("returns a frozen clone of the result if one exists", () => {
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

  describe("addFixture", () => {
    it("adds a fixture to the fixtures object by name", () => {
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

    it("throws an error if a fixture already exists for a given name", () => {
      validator = new Validator({ email: { value: "test@example.com" } })
      const fixture = { name: "email", value: "test@example.com" }

      expect(() => validator.addFixture(fixture)).toThrow()
    })
  })

  describe("findFixture", () => {
    it("finds a fixture in the fixtures object by name", () => {
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

  describe("getFixture", () => {
    it("gets a fixture in the fixtures object by name", () => {
      const fixture = { name: "email", value: "test@example.com" }
      validator.addFixture(fixture)

      const result = validator.getFixture("email")

      expect(result).toBe(fixture)
    })

    it("throws an error if a fixture is not found", () => {
      expect(() => validator.getFixture("unknown")).toThrow()
    })
  })

  describe("removeFixture", () => {
    it("removes a fixture from the fixtures object by name", () => {
      const fixture = { name: "email", value: "test@example.com" }
      validator.addFixture(fixture)

      validator.removeFixture("email")

      expect(validator[$fixtures].email).toBeUndefined()
    })

    it("removes a fixture from the fixtures object by reference", () => {
      const fixture = { name: "email", value: "test@example.com" }
      validator.addFixture(fixture)

      validator.removeFixture(fixture)

      expect(validator[$fixtures].email).toBeUndefined()
    })
  })

  describe("addPlugin", () => {
    it("adds a plugin to the plugins list", () => {
      const plugin = () => {}

      validator.addPlugin(plugin)

      expect(validator[$plugins]).toContain(plugin)
    })
  })

  describe("removePlugin", () => {
    it("removes a plugin from the plugins list", () => {
      const plugin = () => {}
      validator.addPlugin(plugin)

      validator.removePlugin(plugin)

      expect(validator[$plugins]).not.toContain(plugin)
    })
  })

  describe("dispatchResult", () => {
    it("updates the result", () => {
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

  describe("abort", () => {
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

  describe("reset", () => {
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

  describe("async validate", () => {
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

    it("resolves all plugins", async () => {
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

    it("passes the validator proxy into a plugin", async () => {
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

    it("passes the last dispatched result into the first plugin if a result has been dispatched", async () => {
      const result = { state: "initial" }
      validator.dispatchResult(result)
      const plugin = vi.fn()
      validator.addPlugin(plugin)

      await validator.validate()

      expect(plugin).toHaveBeenCalledWith(expect.objectContaining({ result }))
    })

    it("passes a null result into the first plugin if a result has not been dispatched", async () => {
      const plugin = vi.fn()
      validator.addPlugin(plugin)

      await validator.validate()

      expect(plugin).toHaveBeenCalledWith(expect.objectContaining({ result: null }))
    })

    it("passes the last plugin-returned result into the second plugin onwards", async () => {
      const plugins = Array.from(results, result => vi.fn(() => result))
      plugins.forEach(plugin => validator.addPlugin(plugin))

      await validator.validate()

      const expected = [null, results[0], results[0], results[2]]
      plugins.forEach((plugin, index) => expect(plugin).toHaveBeenCalledWith(expect.objectContaining({ result: expected[index] })))
    })

    it("dispatches the last plugin-returned result", async () => {
      results.forEach(result => validator.addPlugin(() => result))

      await validator.validate()

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: results[2] }))
    })

    it("returns the last plugin-returned result", async () => {
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

    it("returns a result with an error state if a plugin throws an error", async () => {
      validator.addPlugin(() => {
        throw new Error("test")
      })

      const result = await validator.validate()

      expect(result).toMatchObject({ state: "error" })
    })

    it("returns a result with an unknown state if a plugin throws a non-error", async () => {
      validator.addPlugin(() => {
        // eslint-disable-next-line no-throw-literal
        throw "test"
      })

      const result = await validator.validate()

      expect(result).toMatchObject({ state: "unknown" })
    })
  })
})

describe("use cases", () => {
  let validator: Validator
  let listener: ReturnType<typeof vi.fn>

  beforeEach(() => {
    validator = new Validator()
    listener = vi.fn()
    validator.addEventListener("validation", listener)
  })

  it("plugin with single fixture", async () => {
    const result = { state: "invalid", message: "Missing email" }
    validator.addPlugin(({ validator }) => {
      const fixture = validator.findFixture("email")
      if (!fixture?.value) {
        return result
      }
    })
    validator.addFixture({ name: "email", value: "" })

    await validator.validate()

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: result }))
  })

  it("plugin with multiple fixtures", async () => {
    const result = { state: "invalid", message: "Passwords do not match" }
    validator.addPlugin(({ validator }) => {
      const fixture1 = validator.findFixture("password")
      const fixture2 = validator.findFixture("reenter-password")
      if (fixture1?.value !== fixture2?.value) {
        return result
      }
    })
    validator.addFixture({ name: "password", value: "abc" })
    validator.addFixture({ name: "reenter-password", value: "abcd" })

    await validator.validate()

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: result }))
  })

  it("slow plugin", async () => {
    validator.addPlugin(() => new Promise(resolve => setTimeout(resolve, 10)))

    await validator.validate()

    expect(listener).toHaveBeenCalledOnce()
  })

  it("slow plugin, aborted", () => {
    validator.addPlugin(() => new Promise(resolve => setTimeout(resolve, 10)))
    validator.validate()

    validator.abort()

    expect(listener).not.toHaveBeenCalled()
  })

  it("slow plugin, debounced", async () => {
    validator.addPlugin(() => new Promise(resolve => setTimeout(resolve, 10)))
    validator.validate()

    await validator.validate()

    expect(listener).toHaveBeenCalledOnce()
  })

  it("dispatch plugin", async () => {
    const result = { state: "pending" }
    validator.addPlugin(({ validator }) => validator.dispatchResult(result))

    await validator.validate()

    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener).toHaveBeenNthCalledWith(1, expect.objectContaining({ detail: result }))
    expect(listener).toHaveBeenNthCalledWith(2, expect.objectContaining({ detail: null }))
  })

  it("abort plugin", async () => {
    validator.addPlugin(async ({ controller }) => controller.abort())

    await validator.validate()

    expect(listener).not.toHaveBeenCalled()
  })
})

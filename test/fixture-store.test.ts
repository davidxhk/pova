import { objectOfType } from "tstk"
import { beforeEach, describe, expect, it } from "vitest"
import { FixtureStore } from "../src/fixture-store"
import { $fixtures, $validators } from "../src/symbols"
import { Validator } from "../src/validator"

describe("the FixtureStore class", () => {
  let fixtureStore: FixtureStore
  let validator: Validator

  beforeEach(() => {
    fixtureStore = new FixtureStore()
    validator = new Validator(fixtureStore)
  })

  describe("its constructor", () => {
    it("initializes with an empty fixtures object", () => {
      expect(fixtureStore[$fixtures]).toEqual({})
    })

    it("initializes with an empty validators object", () => {
      expect(fixtureStore[$validators]).toEqual({})
    })

    it("accepts a custom fixtures object", () => {
      const fixtures = {}

      fixtureStore = new FixtureStore(fixtures)

      expect(fixtureStore[$fixtures]).toBe(fixtures)
    })
  })

  describe("its addFixture method", () => {
    it("adds a fixture with a name", () => {
      const fixture = { name: "email", value: "test@example.com" }

      fixtureStore.addFixture(fixture)

      expect(fixtureStore[$fixtures][fixture.name]).toBe(fixture)
    })

    it("accepts a custom fixture name", () => {
      const fixture = { name: "email", value: "test@example.com" }

      fixtureStore.addFixture(fixture, "test")

      expect(fixtureStore[$fixtures].test).toBe(fixture)
    })

    it("accepts a number as a fixture name", () => {
      const fixture = { name: "email", value: "test@example.com" }

      fixtureStore.addFixture(fixture, 1)

      expect(fixtureStore[$fixtures][1]).toBe(fixture)
    })

    it("accepts a symbol as a fixture name", () => {
      const sym = Symbol("test")
      const fixture = { name: "email", value: "test@example.com" }

      fixtureStore.addFixture(fixture, sym)

      expect(fixtureStore[$fixtures][sym]).toBe(fixture)
    })

    it("throws an error if no fixture name is provided", () => {
      const fixture = { value: "test@example.com" }

      expect(() => fixtureStore.addFixture(fixture)).toThrow()
    })

    it("throws an error if a fixture already exists for the fixture name", () => {
      fixtureStore = new FixtureStore({ email: { value: "test@example.com" } })
      const fixture = { name: "email", value: "test@example.com" }

      expect(() => fixtureStore.addFixture(fixture)).toThrow()
    })
  })

  describe("its addValidator method", () => {
    it("adds a validator to the validators array for a fixture name", () => {
      fixtureStore[$validators].test = []

      fixtureStore.addValidator("test", validator)

      expect(fixtureStore[$validators].test.includes(validator))
    })

    it("creates a validators array for a fixture name if it does not exist", () => {
      fixtureStore.addValidator("test", validator)

      expect(fixtureStore[$validators].test).toBeInstanceOf(Array)
    })
  })

  describe("its findFixture method", () => {
    it("finds a fixture with a fixture name", () => {
      const fixture = { name: "email", value: "test@example.com" }
      fixtureStore.addFixture(fixture)

      const result = fixtureStore.findFixture("email")

      expect(result).toBe(fixture)
    })

    it("returns undefined if the fixture name does not exist", () => {
      const result = fixtureStore.findFixture("unknown")

      expect(result).toBeUndefined()
    })
  })

  describe("its getFixture method", () => {
    it("gets a fixture with a fixture name", () => {
      const fixture = { name: "email", value: "test@example.com" }
      fixtureStore.addFixture(fixture)

      const result = fixtureStore.getFixture("email")

      expect(result).toBe(fixture)
    })

    it("checks if a fixture matches a primitive type", () => {
      const fixture = 1
      fixtureStore.addFixture(fixture, "test")

      const result = fixtureStore.getFixture("test", { type: "number" })

      expect(result).toBeTypeOf("number")
      expect(result).toBe(fixture)
    })

    it("checks if a fixture is an instance of a class", () => {
      class TestClass {}
      const fixture = new TestClass()
      fixtureStore.addFixture(fixture, "test")

      const result = fixtureStore.getFixture("test", { type: TestClass })

      expect(result).toBeInstanceOf(TestClass)
      expect(result).toBe(fixture)
    })

    it("checks if a fixture satisfies a predicate type", () => {
      const fixture = { checked: false }
      fixtureStore.addFixture(fixture, "test")

      const result = fixtureStore.getFixture("test", { type: objectOfType(["checked"], "boolean") })

      expect(result).toBe(fixture)
    })

    it("throws an error if a fixture does not match a primitive type", () => {
      const fixture = 1
      fixtureStore.addFixture(fixture, "test")

      expect(() => fixtureStore.getFixture("test", { type: "string" })).toThrow(TypeError)
    })

    it("throws an error if a fixture is not an instance of a class", () => {
      class TestClass {}
      class AnotherClass {}
      const fixture = new TestClass()
      fixtureStore.addFixture(fixture, "test")

      expect(() => fixtureStore.getFixture("test", { type: AnotherClass })).toThrow(TypeError)
    })

    it("throws an error if the fixture name does not exist", () => {
      expect(() => fixtureStore.getFixture("unknown")).toThrow()
    })
  })

  describe("its getFixtureValue method", () => {
    it("gets the value of a fixture with a fixture name", () => {
      const fixture = { name: "email", value: "test@example.com" }
      fixtureStore.addFixture(fixture)

      const result = fixtureStore.getFixtureValue("email")

      expect(result).toBe(fixture.value)
    })

    it("accepts a custom key", () => {
      const fixture = { name: "email", email: "test@example.com" }
      fixtureStore.addFixture(fixture)

      const result = fixtureStore.getFixtureValue("email", { key: "email" })

      expect(result).toBe(fixture.email)
    })

    it("checks if a fixture value matches a primitive type", () => {
      const fixture = { name: "test", value: 1 }
      fixtureStore.addFixture(fixture)

      const result = fixtureStore.getFixtureValue("test", { type: "number" })

      expect(result).toBeTypeOf("number")
      expect(result).toBe(fixture.value)
    })

    it("checks if a fixture value is an instance of a class", () => {
      class TestClass {}
      const fixture = { name: "test", value: new TestClass() }
      fixtureStore.addFixture(fixture)

      const result = fixtureStore.getFixtureValue("test", { type: TestClass })

      expect(result).toBeInstanceOf(TestClass)
      expect(result).toBe(fixture.value)
    })

    it("throws an error if a fixture value does not match a primitive type", () => {
      const fixture = { name: "test", value: 1 }
      fixtureStore.addFixture(fixture)

      expect(() => fixtureStore.getFixtureValue("test", { type: "string" })).toThrow(TypeError)
    })

    it("throws an error if a fixture value is not an instance of a class", () => {
      class TestClass {}
      class AnotherClass {}
      const fixture = { name: "test", value: new TestClass() }
      fixtureStore.addFixture(fixture)

      expect(() => fixtureStore.getFixtureValue("test", { type: AnotherClass })).toThrow(TypeError)
    })

    it("throws an error if a fixture value does not exist", () => {
      const fixture = 1
      fixtureStore.addFixture(fixture, "test")

      expect(() => fixtureStore.getFixtureValue("test")).toThrow()
    })

    it("throws an error if the fixture name does not exist", () => {
      expect(() => fixtureStore.getFixtureValue("unknown")).toThrow()
    })
  })

  describe("its getValidators method", () => {
    it("gets a non-empty validators array for a fixture name", () => {
      fixtureStore[$validators].test = [validator]

      const validators = fixtureStore.getValidators("test")

      expect(validators).toBe(fixtureStore[$validators].test)
    })

    it("throws an error if no validators array exists for the fixture name", () => {
      expect(() => fixtureStore.getValidators("test")).toThrow()
    })

    it("throws an error if a validators array exists for the fixture name but is empty", () => {
      fixtureStore[$validators].test = []
      expect(() => fixtureStore.getValidators("test")).toThrow()
    })
  })

  describe("its hasFixture method", () => {
    it("returns true if a fixture exists for a fixture name", () => {
      const fixture = { name: "email", value: "test@example.com" }
      fixtureStore.addFixture(fixture)

      const result = fixtureStore.hasFixture("email")

      expect(result).toBe(true)
    })

    it("returns false if no fixture exists for the fixture name", () => {
      const result = fixtureStore.hasFixture("email")

      expect(result).toBe(false)
    })
  })

  describe("its hasValidator method", () => {
    it("returns true if a validator exists for a fixture name", () => {
      fixtureStore.addValidator("test", validator)

      expect(fixtureStore.hasValidator("test", validator)).toBe(true)
    })

    it("returns false if a validator does not exist for a fixture name", () => {
      expect(fixtureStore.hasValidator("test", validator)).toBe(false)
    })
  })

  describe("its hasValidators method", () => {
    it("returns true if a non-empty validators array exists for a fixture name", () => {
      fixtureStore.addValidator("test", validator)

      expect(fixtureStore.hasValidators("test")).toBe(true)
    })

    it("returns false if no validators array exists for the fixture name", () => {
      expect(fixtureStore.hasValidators("test")).toBe(false)
    })

    it("returns false if a validators array exists for the fixture name but is empty", () => {
      fixtureStore[$validators].test = []
      expect(fixtureStore.hasValidators("test")).toBe(false)
    })
  })

  describe("its removeFixture method", () => {
    it("removes a fixture by its fixture name", () => {
      const fixture = { name: "email", value: "test@example.com" }
      fixtureStore.addFixture(fixture)

      fixtureStore.removeFixture("email")

      expect(fixtureStore[$fixtures].email).toBeUndefined()
    })

    it("removes a fixture by reference", () => {
      const fixture = { name: "email", value: "test@example.com" }
      fixtureStore.addFixture(fixture)

      fixtureStore.removeFixture(fixture)

      expect(fixtureStore[$fixtures].email).toBeUndefined()
    })

    it("returns false if no fixture exists for the fixture name or reference", () => {
      expect(fixtureStore.removeFixture("nope")).toBe(false)
      expect(fixtureStore.removeFixture({ value: "not in store" })).toBe(false)
    })
  })

  describe("its removeValidator method", () => {
    it("removes a validator from the validators array for a fixture name", () => {
      fixtureStore[$validators].test = [validator]

      const result = fixtureStore.removeValidator(validator, "test")

      expect(result).toBe(true)
      expect(fixtureStore[$validators].test.includes(validator)).toBe(false)
    })

    it("removes a validator from all validators arrays if no fixture name is provided", () => {
      fixtureStore.addValidator("email", validator)
      fixtureStore.addValidator("password", validator)

      const result = fixtureStore.removeValidator(validator)

      expect(result).toBe(true)
      expect(fixtureStore[$validators].email.includes(validator)).toBe(false)
      expect(fixtureStore[$validators].password.includes(validator)).toBe(false)
    })

    it("returns false if a validator does not exist in any validators array", () => {
      const result = fixtureStore.removeValidator(validator)
      expect(result).toBe(false)
    })
  })
})

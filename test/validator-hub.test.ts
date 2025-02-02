import type { Mock } from "vitest"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { FixtureStore } from "../src/fixture-store"
import { $fixtures, $props, $validators } from "../src/symbols"
import { Validator } from "../src/validator"
import { ValidatorHub } from "../src/validator-hub"

describe("the ValidatorHub class", () => {
  let fixtureStore: FixtureStore
  let validatorHub: ValidatorHub
  let listener: Mock<EventListener>

  beforeEach(() => {
    fixtureStore = new FixtureStore()
    validatorHub = new ValidatorHub(fixtureStore)
    listener = vi.fn()
    validatorHub.addEventListener("validation", listener)
  })

  describe("its constructor", () => {
    it("initializes with a fixture store", () => {
      expect(validatorHub[$fixtures]).toBe(fixtureStore)
    })

    it("initializes with an empty validators object", () => {
      expect(validatorHub[$validators]).toEqual({})
    })
  })

  describe("its createValidator method", () => {
    it("creates a new validator with a validator name", () => {
      const validator = validatorHub.createValidator("test")

      expect(validator).toBeInstanceOf(Validator)
    })

    it("associates the validator with the validator name", () => {
      const validator = validatorHub.createValidator("test")

      expect(validatorHub[$validators].test).toBe(validator)
    })

    it("initializes the validator with its fixture store", () => {
      const validator = validatorHub.createValidator("test")

      expect(validator[$fixtures]).toBe(validatorHub[$fixtures])
    })

    it("initializes the validator with any default props", () => {
      const defaultProps = { result: "valid" }

      const validator = validatorHub.createValidator("test", defaultProps)

      expect(validator[$props]).toBe(defaultProps)
    })

    it("dispatches a 'create' validator event", () => {
      validatorHub.createValidator("test")

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { name: "test", type: "create" } }))
    })

    it("wires up the validator's 'validation' event to dispatch a 'result' validator event", () => {
      const validator = validatorHub.createValidator("test")

      const result = { state: "valid" }
      validator.dispatchValidationEvent(result)
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { name: "test", type: "result", result } }))
    })

    it("throws an error if the validator name already exists", () => {
      validatorHub.createValidator("test")

      expect(() => validatorHub.createValidator("test")).toThrow()
    })
  })

  describe("its findValidator method", () => {
    it("finds a validator with a validator name", () => {
      const validator = validatorHub.createValidator("test")

      const result = validatorHub.findValidator("test")

      expect(result).toBe(validator)
    })

    it("returns undefined if the validator name does not exist", () => {
      const result = validatorHub.findValidator("unknown")

      expect(result).toBeUndefined()
    })
  })

  describe("its getValidator method", () => {
    it("gets a validator with a validator name", () => {
      const validator = validatorHub.createValidator("test")

      const result = validatorHub.getValidator("test")

      expect(result).toBe(validator)
    })

    it("throws an error if the validator name does not exist", () => {
      expect(() => validatorHub.getValidator("unknown")).toThrow()
    })
  })

  describe("its getAllValidators method", () => {
    it("gets an array of all created validators", () => {
      const validator1 = validatorHub.createValidator("test1")
      const validator2 = validatorHub.createValidator("test2")

      const allValidators = validatorHub.getAllValidators()

      expect(allValidators).toHaveLength(2)
      expect(allValidators).toEqual([validator1, validator2])
    })

    it("returns an empty array if no validators have been created", () => {
      expect(validatorHub.getAllValidators()).toEqual([])
    })
  })

  describe("its hasValidator method", () => {
    it("returns true if a validator exists for a validator name", () => {
      validatorHub.createValidator("test")

      const result = validatorHub.hasValidator("test")

      expect(result).toBe(true)
    })

    it("returns false if no validator exists for the validator name", () => {
      const result = validatorHub.hasValidator("unknown")

      expect(result).toBe(false)
    })
  })

  describe("its removeValidator method", () => {
    it("removes a validator by its validator name", () => {
      validatorHub.createValidator("test")

      const result = validatorHub.removeValidator("test")

      expect(result).toBe(true)
      expect(validatorHub[$validators].test).toBeUndefined()
    })

    it("dispatches a 'remove' validator event", () => {
      validatorHub.createValidator("test")

      validatorHub.removeValidator("test")

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { name: "test", type: "remove" } }))
    })

    it("returns false if no validator exists for the validator name", () => {
      const result = validatorHub.removeValidator("test")

      expect(result).toBe(false)
    })
  })
})

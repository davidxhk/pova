import { describe, expect, it } from "vitest"
import { AbortablePromise, AbortError } from "../src/abortable-promise"

describe("class AbortablePromise", () => {
  describe("constructor", () => {
    it("runs the executor and resolves with its value", async () => {
      const promise = new AbortablePromise(resolve => resolve(1))

      const result = await promise
      expect(result).toBe(1)
    })

    it("uses the specified controller when provided", () => {
      const controller = new AbortController()

      const promise = new AbortablePromise(resolve => resolve(1), controller)

      // @ts-expect-error internal property not supported yet
      expect(promise.controller).toBe(controller)
    })

    it("uses a new controller when not provided", () => {
      const promise = new AbortablePromise(resolve => resolve(1))

      // @ts-expect-error internal property not supported yet
      expect(promise.controller).toBeInstanceOf(AbortController)
    })
  })

  describe("get signal", () => {
    it("returns the controller's signal", () => {
      const promise = AbortablePromise.resolve(1)

      const signal = promise.signal

      // @ts-expect-error internal property not supported yet
      expect(signal).toBe(promise.controller.signal)
    })
  })

  describe("abort", () => {
    it("aborts the signal and rejects the promise", async () => {
      const promise = AbortablePromise.resolve(1)

      promise.abort()

      expect(promise.signal.aborted).toBe(true)
      await expect(promise).rejects.toBeInstanceOf(AbortError)
    })

    it("uses the specified reason when provided", async () => {
      const promise = AbortablePromise.resolve(1)
      const reason = "test"

      promise.abort(reason)

      expect(promise.signal.reason).toBe(reason)
      await expect(promise).rejects.toBeInstanceOf(AbortError)
    })

    it("uses the default reason when not provided", async () => {
      const promise = AbortablePromise.resolve(1)

      promise.abort()

      expect(promise.signal.reason).toBeInstanceOf(DOMException)
      await expect(promise).rejects.toBeInstanceOf(AbortError)
    })
  })

  describe("static resolve", () => {
    it("creates a new resolved abortable promise with a provided value", async () => {
      const promise = AbortablePromise.resolve(1)

      const result = await promise
      expect(result).toBe(1)
    })

    it("creates a new resolved abortable promise with a promise", async () => {
      const value = Promise.resolve(1)

      const promise = AbortablePromise.resolve(value)

      const result = await promise
      expect(result).toBe(1)
    })

    it("uses the specified controller when provided", () => {
      const controller = new AbortController()

      const promise = AbortablePromise.resolve(1, controller)

      // @ts-expect-error internal property not supported yet
      expect(promise.controller).toBe(controller)
    })

    it("uses a new controller when not provided", () => {
      const promise = AbortablePromise.resolve(1)

      // @ts-expect-error internal property not supported yet
      expect(promise.controller).toBeInstanceOf(AbortController)
    })
  })
})

import type { Mock } from "vitest"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AbortablePromise } from "../src/abortable-promise"
import { $controller } from "../src/symbols"

describe("the AbortablePromise class", () => {
  let executor: Mock<ConstructorParameters<typeof AbortablePromise<any>>[0]>
  let promise: AbortablePromise<any>

  beforeEach(() => {
    executor = vi.fn()
    promise = new AbortablePromise(executor)
  })

  it("resolves with a value", async () => {
    const promise = new AbortablePromise(resolve => resolve(1))

    await expect(promise).resolves.toBe(1)
  })

  it("resolves with an awaited promise-like value", async () => {
    const value = Promise.resolve(1)

    const promise = new AbortablePromise(resolve => resolve(value))

    await expect(promise).resolves.toBe(1)
  })

  it("rejects with an error", async () => {
    const error = new Error("test")

    const promise = new AbortablePromise((_resolve, reject) => reject(error))

    await expect(promise).rejects.toThrow(error)
  })

  describe("its constructor", () => {
    it("initializes a new abort controller", () => {
      expect(promise[$controller]).toBeInstanceOf(AbortController)
    })

    it("calls the executor once", () => {
      expect(executor).toHaveBeenCalledOnce()
    })

    it("passes a resolve function to the executor", async () => {
      const resolve = executor.mock.calls[0][0]

      resolve(1)

      await expect(promise).resolves.toEqual(1)
    })

    it("passes a reject function to the executor", async () => {
      const reject = executor.mock.calls[0][1]

      reject()

      await expect(promise).rejects.toThrow()
    })

    it("passes the abort controller to the executor", async () => {
      const controller = executor.mock.calls[0][2]

      expect(controller).toBe(promise[$controller])
    })
  })

  describe("its signal getter", () => {
    it("returns the abort controller signal", () => {
      const signal = promise.signal

      expect(signal).toBe(promise[$controller].signal)
    })
  })

  describe("its abort method", () => {
    it("aborts the abort controller", async () => {
      promise.abort()

      expect(promise[$controller].signal.aborted).toBe(true)
      await expect(promise).rejects.toThrow()
    })

    it("rejects the promise with an abort error", async () => {
      promise.abort()

      await expect(promise).rejects.toThrow(DOMException)
    })

    it("accepts a custom reason", async () => {
      const reason = "test"

      promise.abort(reason)

      expect(promise[$controller].signal.reason).toBe(reason)
      await expect(promise).rejects.toThrow(reason)
    })
  })
})

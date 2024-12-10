import { beforeEach, describe, expect, it, vi } from "vitest"
import { AbortablePromise } from "../src/abortable-promise"
import { $controller } from "../src/symbols"

describe("class AbortablePromise", () => {
  let promise: AbortablePromise<any>

  beforeEach(() => {
    promise = new AbortablePromise(resolve => setTimeout(() => resolve(1)))
  })

  it("resolves with a given value if one is provided", async () => {
    promise = new AbortablePromise(resolve => resolve(1))

    await expect(promise).resolves.toBe(1)
  })

  it("resolves with an awaited value if a promise-like value is provided", async () => {
    const value = Promise.resolve(1)

    promise = new AbortablePromise(resolve => resolve(value))

    await expect(promise).resolves.toBe(1)
  })

  describe("its constructor", () => {
    it("initializes with a new abort controller", () => {
      expect(promise[$controller]).toBeInstanceOf(AbortController)
    })

    describe("calls the executor", async () => {
      const executor = vi.fn()
      void new AbortablePromise(executor)

      it("once", () => {
        expect(executor).toHaveBeenCalledOnce()
      })

      it("passing a resolve function to it", async () => {
        expect(executor.mock.calls[0].at(0)).toEqual(expect.any(Function))
      })

      it("passing a reject function to it", async () => {
        expect(executor.mock.calls[0].at(1)).toEqual(expect.any(Function))
      })

      it("passing an abort controller to it", async () => {
        expect(executor.mock.calls[0].at(2)).toEqual(expect.any(AbortController))
      })
    })
  })

  describe("its signal getter", () => {
    it("returns the abort controller signal", () => {
      const signal = promise.signal

      expect(signal).toBe(promise[$controller].signal)
    })
  })

  describe("its abort method", () => {
    it("aborts the abort controller and rejects the promise with an abort error", async () => {
      promise.abort()

      expect(promise[$controller].signal.aborted).toBe(true)
      await expect(promise).rejects.toThrow(DOMException)
    })

    it("uses a given reason if one is provided", async () => {
      const reason = "test"

      promise.abort(reason)

      expect(promise[$controller].signal.reason).toBe(reason)
      await expect(promise).rejects.toThrow(reason)
    })
  })
})

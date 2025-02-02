import { describe, expect, it } from "vitest"
import { isAbortError } from "../../src/utils/is-abort-error"

describe("the isAbortError function", () => {
  it("returns true for a DOMException with name 'AbortError'", () => {
    const error = new DOMException("Request aborted", "AbortError")
    expect(isAbortError(error)).toBe(true)
  })

  it("returns false for a DOMException with a different name", () => {
    const error = new DOMException("Something else", "TypeError")
    expect(isAbortError(error)).toBe(false)
  })

  it("returns false for an error that is not a DOMException", () => {
    const error = new Error("Just a normal error")
    expect(isAbortError(error)).toBe(false)
  })

  it("returns false when the error is null or undefined", () => {
    expect(isAbortError(null)).toBe(false)
    expect(isAbortError(undefined)).toBe(false)
  })

  it("returns false for arbitrary non-error values", () => {
    expect(isAbortError("AbortError")).toBe(false)
    expect(isAbortError({ name: "AbortError" })).toBe(false)
    expect(isAbortError(123)).toBe(false)
  })
})

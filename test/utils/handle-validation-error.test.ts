import { describe, expect, it } from "vitest"
import { handleValidationError } from "../../src/utils"

describe("the handleValidationError function", () => {
  it("returns a validation result with an 'aborted' state if the error is an AbortError", () => {
    const error = new DOMException("test", "AbortError")

    const result = handleValidationError(error)

    expect(result).toMatchObject({ state: "aborted" })
  })

  it("returns a validation result with an 'error' state if the error is an Error", () => {
    const error = new Error("test")

    const result = handleValidationError(error)

    expect(result).toMatchObject({ state: "error" })
  })

  it("returns a validation result with an 'unknown' state if the error is not an Error", () => {
    const error = "test"

    const result = handleValidationError(error)

    expect(result).toMatchObject({ state: "unknown" })
  })
})

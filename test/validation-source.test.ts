import { describe, expect, it, vi } from "vitest"
import { ValidationSource } from "../src/validation-source"

describe("the ValidationSource class", () => {
  describe("its dispatchValidationEvent method", () => {
    it("dispatches a 'validation' event with a custom detail", () => {
      const source = new ValidationSource<number>()
      const listener = vi.fn()
      source.addEventListener("validation", listener)

      source.dispatchValidationEvent(42)

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: 42 }))
    })
  })
})

import { describe, expect, it } from "vitest"
import { createReadonlyProxy } from "../src/create-readonly-proxy"

describe("createReadonlyProxy", () => {
  it("creates a readonly proxy for a target object", () => {
    const target = { a: 1, b: 2 }
    const proxy = createReadonlyProxy(target)

    expect(proxy).toMatchObject(target)
    expect(proxy).not.toBe(target)
  })

  describe("the readonly proxy", () => {
    it("throws an error on set operations", () => {
      const target = { a: 1 }
      const proxy = createReadonlyProxy(target)

      expect(() => (proxy.a = 2)).toThrowError(TypeError)
    })

    it("throws an error on delete operations", () => {
      const target: { a?: number } = { a: 1 }
      const proxy = createReadonlyProxy(target)

      expect(() => (delete proxy.a)).toThrowError(TypeError)
    })

    it("allows read access to masked properties", () => {
      const target = { a: 1, b: 2, c: 3 }
      const proxy = createReadonlyProxy(target, "a", "c")

      expect(proxy.a).toBe(1)
      expect(proxy.c).toBe(3)
    })

    it("restricts read access to unmasked properties", () => {
      const target = { a: 1, b: 2 }
      const proxy = createReadonlyProxy(target, "a")

      // @ts-expect-error "b" should not be in the proxy's type
      expect(proxy.b).toBeUndefined()
    })

    it("binds methods of the target object", () => {
      const target = {
        value: 42,
        getValue() {
          return this.value
        },
      }
      const proxy = createReadonlyProxy(target)

      expect(proxy.getValue()).toBe(42)
    })

    it("handles symbols as keys in the mask", () => {
      const sym = Symbol("sym")
      const target = { [sym]: 1 }
      const proxy = createReadonlyProxy(target, sym)

      expect(proxy[sym]).toBe(1)
    })

    it("handles numbers as keys in the mask", () => {
      const target = { 1: 2 }
      const proxy = createReadonlyProxy(target, 1)

      expect(proxy[1]).toBe(2)
    })
  })
})

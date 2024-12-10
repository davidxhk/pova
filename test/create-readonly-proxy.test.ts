import { describe, expect, it } from "vitest"
import { createReadonlyProxy } from "../src/create-readonly-proxy"

describe("function createReadonlyProxy", () => {
  it("creates a readonly proxy for a given object", () => {
    const target = { a: 1, b: 2 }
    const proxy = createReadonlyProxy(target)

    expect(proxy).toMatchObject(target)
    expect(proxy).not.toBe(target)
  })

  it("applies a given mask to the readonly proxy if one is provided", () => {
    const target = { a: 1, b: 2 }
    const proxy = createReadonlyProxy(target, "b")

    const { a, ...expected } = target
    expect(proxy).toMatchObject(expected)
  })

  it("accepts symbols as keys for the mask", () => {
    const sym = Symbol("sym")
    const target = { a: 1, [sym]: 2 }
    const proxy = createReadonlyProxy(target, sym)

    const { a, ...expected } = target
    expect(proxy).toMatchObject(expected)
  })

  it("accepts numbers as keys for the mask", () => {
    const target = { a: 1, 1: 2 }
    const proxy = createReadonlyProxy(target, 1)

    const { a, ...expected } = target
    expect(proxy).toMatchObject(expected)
  })

  describe("the readonly proxy", () => {
    it("throws an error on set operations", () => {
      const target = { a: 1 }
      const proxy = createReadonlyProxy(target)

      expect(() => (proxy.a = 2)).toThrowError(TypeError)
    })

    it("throws an error on delete operations", () => {
      const target = { a: 1 }
      const proxy = createReadonlyProxy(target)

      // @ts-expect-error a is not optional
      expect(() => (delete proxy.a)).toThrowError(TypeError)
    })

    it("allows read access to masked properties", () => {
      const target = { a: 1, b: 2 }
      const proxy = createReadonlyProxy(target, "b")

      expect(proxy.b).toBe(target.b)
    })

    it("restricts read access to unmasked properties", () => {
      const target = { a: 1, b: 2 }
      const proxy = createReadonlyProxy(target, "b")

      // @ts-expect-error "a" should not be in the proxy's type
      expect(proxy.a).toBeUndefined()
    })

    describe("binds methods of the target object", () => {
      class TestClass {
        _a = 1
        #b = 2
        get a() {
          return this._a
        }

        get b() {
          return this.#b
        }
      }
      const target = new TestClass()
      const proxy = createReadonlyProxy(target, "a", "b")

      it("allowing access to unmasked properties", () => {
        expect(proxy.a).toBe(target.a)
      })

      it("allowing access to private properties", () => {
        expect(proxy.b).toBe(target.b)
      })
    })
  })
})

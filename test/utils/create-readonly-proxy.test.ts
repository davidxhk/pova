import { describe, expect, it } from "vitest"
import { createReadonlyProxy } from "../../src/utils"

describe("the createReadonlyProxy function", () => {
  it("creates a readonly proxy for a target object", () => {
    const target = { a: 1, b: 2 }
    const proxy = createReadonlyProxy(target)

    expect(proxy).toEqual(target)
    expect(proxy).not.toBe(target)
  })

  it("creates a readonly proxy that only contains the picked properties if pick is provided", () => {
    const target = { a: 1, b: 2 }
    const proxy = createReadonlyProxy(target, ["b"])

    const { a, ...expected } = target
    expect(proxy).toEqual(expected)
  })

  it("allows symbol keys to be picked", () => {
    const sym = Symbol("sym")
    const target = { a: 1, [sym]: 2 }
    const proxy = createReadonlyProxy(target, [sym])

    const { a, ...expected } = target
    expect(proxy).toEqual(expected)
  })

  it("allows number keys to be picked", () => {
    const target = { a: 1, 1: 2 }
    const proxy = createReadonlyProxy(target, [1])

    const { a, ...expected } = target
    expect(proxy).toEqual(expected)
  })

  describe("the readonly proxy", () => {
    it("throws an error on set operations", () => {
      const target = { a: 1 }
      const proxy = createReadonlyProxy(target)

      // @ts-expect-error proxy.a is readonly
      expect(() => (proxy.a = 2)).toThrowError(TypeError)
    })

    it("throws an error on delete operations", () => {
      const target = { a: 1 }
      const proxy = createReadonlyProxy(target)

      // @ts-expect-error proxy.a is readonly
      expect(() => (delete proxy.a)).toThrowError(TypeError)
    })

    it("allows read access to public properties of the target object", () => {
      const target = { a: 1, b: 2 }
      const proxy = createReadonlyProxy(target)

      expect(proxy.a).toBe(target.a)
      expect(proxy.b).toBe(target.b)
    })

    it("allows indirect access to private properties of the target object", () => {
      const target = new class {
        #a = 1
        get a() { return this.#a }
      }()

      const proxy = createReadonlyProxy(target)

      expect(proxy.a).toBe(target.a)
    })

    it("allows read access only to the picked properties if pick is provided", () => {
      const target = { a: 1, b: 2 }
      const proxy = createReadonlyProxy(target, ["b"])

      // @ts-expect-error proxy.a does not exist
      expect(proxy.a).toBeUndefined()
      expect(proxy.b).toBe(target.b)
    })

    it("allows indirect access to unpicked properties if pick is provided", () => {
      const target = {
        _b: 1,
        get b() { return this._b },
      }

      const proxy = createReadonlyProxy(target, ["b"])

      expect(proxy.b).toBe(target._b)
    })
  })
})

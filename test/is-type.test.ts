import { describe, expect, it } from "vitest"
import { isType } from "../src/is-type"

describe("function isType", () => {
  it("returns true if the value matches the given primitive type", () => {
    expect(isType(undefined, "undefined")).toBe(true)
    expect(isType(null, "object")).toBe(true)
    expect(isType({}, "object")).toBe(true)
    expect(isType([], "object")).toBe(true)
    expect(isType(true, "boolean")).toBe(true)
    expect(isType(false, "boolean")).toBe(true)
    expect(isType(42, "number")).toBe(true)
    expect(isType(Number.NaN, "number")).toBe(true)
    expect(isType(Infinity, "number")).toBe(true)
    expect(isType(9007199254740991n, "bigint")).toBe(true)
    expect(isType("hello", "string")).toBe(true)
    expect(isType(Symbol("sym"), "symbol")).toBe(true)
    expect(isType(() => {}, "function")).toBe(true)
  })

  it("returns false if the value does not match the given primitive type", () => {
    expect(isType("hello", "number")).toBe(false)
    expect(isType(42, "boolean")).toBe(false)
    expect(isType({}, "string")).toBe(false)
    expect(isType(Symbol("sym"), "function")).toBe(false)
    expect(isType(() => {}, "object")).toBe(false)
  })

  it("returns true if the value is an instance of the given class", () => {
    class TestClass {}
    const instance = new TestClass()
    expect(isType(instance, TestClass)).toBe(true)
  })

  it("returns false if the value is not an instance of the given class", () => {
    class TestClass {}
    class AnotherClass {}
    expect(isType({}, TestClass)).toBe(false)
    expect(isType(new AnotherClass(), TestClass)).toBe(false)
  })

  it("throws an error if an invalid primitive type is provided", () => {
    // @ts-expect-error type should be a valid primitive type
    expect(() => isType("hello", "notaprimitivetype")).toThrow(TypeError)
  })

  it("throws an error if an invalid class is provided", () => {
    // @ts-expect-error type should be a valid class
    expect(() => isType({}, () => {})).toThrow(TypeError)
  })

  it("throws an error if an invalid type is provided", () => {
    for (const type of [undefined, null, {}, [], true, 42, 9007199254740991n, Symbol("sym")]) {
    // @ts-expect-error type should be a valid type
      expect(() => isType("hello", type)).toThrow(TypeError)
    }
  })
})

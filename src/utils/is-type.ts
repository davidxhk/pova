import type { ClassType, PrimitiveType, PrimitiveTypes } from "../types"

const PRIMITIVE_TYPES = Object.freeze(["undefined", "object", "boolean", "number", "bigint", "string", "symbol", "function"] satisfies PrimitiveType[] as string[])

export function isType<P extends PrimitiveType>(value: any, type: P): value is PrimitiveTypes[P]
export function isType<T>(value: any, type: ClassType<T>): value is T
export function isType(value: any, type: any): boolean {
  switch (typeof type) {
    case "string":
      if (!PRIMITIVE_TYPES.includes(type)) {
        throw new TypeError(`Invalid primitive type: ${type}`)
      }

      return typeof value === type

    case "function":
      if (!("prototype" in type)) {
        throw new TypeError(`Invalid class type: ${type}`)
      }

      return value instanceof type

    default:
      throw new TypeError(`Invalid type: ${type}`)
  }
}

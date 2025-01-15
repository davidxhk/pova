import type { PrimitiveType } from "../types"

const PROPERTY_TYPES = Object.freeze(["string", "number", "symbol"] satisfies PrimitiveType[] as string[])

export function isPropertyKey(value: any): value is PropertyKey {
  return PROPERTY_TYPES.includes(typeof value)
}

export interface PrimitiveTypes {
  undefined: undefined
  object: object | null
  boolean: boolean
  number: number
  bigint: bigint
  string: string
  symbol: symbol
  function: (...args: any[]) => any
}

export type PrimitiveType = keyof PrimitiveTypes

const PRIMITIVE_TYPES = Object.freeze(["undefined", "object", "boolean", "number", "bigint", "string", "symbol", "function"] satisfies PrimitiveType[] as string[])

export interface Class<T> {
  new (): T
  prototype: T
}

export function isType<P extends PrimitiveType>(value: any, type: P): value is PrimitiveTypes[P]
export function isType<T>(value: any, type: Class<T>): value is T
export function isType(value: any, type: any): boolean {
  switch (typeof type) {
    case "string":
      if (!PRIMITIVE_TYPES.includes(type)) {
        throw new TypeError(`Invalid primitive type: ${type}`)
      }
      // eslint-disable-next-line valid-typeof
      return typeof value === type
    case "function":
      if (!("prototype" in type)) {
        throw new TypeError(`Invalid class: ${type.name}`)
      }
      return value instanceof type
    default:
      throw new TypeError(`Invalid type: ${type}`)
  }
}

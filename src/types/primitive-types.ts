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

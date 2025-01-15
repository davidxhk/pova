import type { NonEmptyArray } from "../types"

export function createReadonlyProxy<T extends object>(target: T): Readonly<T>
export function createReadonlyProxy<T extends object, K extends NonEmptyArray<keyof T>>(target: T, pick: Readonly<K>): Readonly<Pick<T, K[number]>>
export function createReadonlyProxy<T extends object, K extends NonEmptyArray<keyof T>>(target: object, pick?: Readonly<K>): object {
  const handler: ProxyHandler<T> = {
    get(target, prop) {
      const value = Reflect.get(target, prop)
      return typeof value === "function" ? value.bind(target) : value
    },

    set() {
      throw new TypeError("Property modification is not allowed.")
    },

    deleteProperty() {
      throw new TypeError("Property deletion is not allowed.")
    },
  }

  if (pick) {
    const pickedKeys = new Set(pick
      .filter(key => Object.hasOwn(target, key))
      .map(key => typeof key === "number"
        ? key.toString()
        : key as string | symbol,
      ),
    )

    handler.get = (target, prop) => {
      if (Object.hasOwn(target, prop) && !pickedKeys.has(prop)) {
        return
      }

      const value = Reflect.get(target, prop)
      return typeof value === "function" ? value.bind(target) : value
    }

    handler.ownKeys = (target) => {
      return Reflect.ownKeys(target).filter(prop => pickedKeys.has(prop))
    }
  }

  return new Proxy(target, handler)
}

export function createReadonlyProxy<T extends { [key: PropertyKey]: any }>(target: T): T
export function createReadonlyProxy<T extends { [key: PropertyKey]: any }, K extends (keyof T)[]>(target: T, ...mask: K): Pick<T, K[number]>
export function createReadonlyProxy(target: { [key: PropertyKey]: any }, ...mask: PropertyKey[]): any {
  const maskedProps = processMask(mask)
  return new Proxy(target, {
    set: () => {
      throw new TypeError("Property modification is not allowed.")
    },

    deleteProperty: () => {
      throw new TypeError("Property deletion is not allowed.")
    },

    ...(mask.length > 0 && {
      get: (target, prop) => {
        if (Object.hasOwn(target, prop) && !maskedProps.has(prop)) {
          return
        }
        const value = Reflect.get(target, prop)
        return typeof value === "function" ? value.bind(target) : value
      },

      ownKeys: (target) => {
        return Reflect.ownKeys(target).filter(prop => maskedProps.has(prop))
      },
    }),
  })
}

function processMask(mask: PropertyKey[]): Set<PropertyKey> {
  const mapped = mask.map(key => typeof key === "number" ? key.toString() : key)
  return new Set(mapped)
}

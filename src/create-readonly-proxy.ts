export function createReadonlyProxy<T extends { [key: string | symbol | number]: any }>(target: T): T
export function createReadonlyProxy<T extends { [key: string | symbol | number]: any }, K extends (keyof T)[]>(target: T, ...mask: K): Pick<T, K[number]>
export function createReadonlyProxy(target: { [key: string | symbol | number]: any }, ...mask: (string | symbol | number)[]): any {
  const maskedProps = processMask(mask)
  return new Proxy(target, {
    set: () => {
      throw new TypeError("Property modification is not allowed.")
    },

    deleteProperty: () => {
      throw new TypeError("Property deletion is not allowed.")
    },

    ...(mask.length > 0 && {
      get: (target, prop, receiver) => {
        if (Object.hasOwn(target, prop) && !maskedProps.has(prop)) {
          return
        }
        const value = Reflect.get(target, prop, receiver)
        return typeof value == "function" ? value.bind(target) : value
      },

      ownKeys: (target) => {
        return Reflect.ownKeys(target).filter(prop => maskedProps.has(prop))
      },
    }),
  })
}

function processMask(mask: (string | symbol | number)[]): Set<string | symbol | number> {
  const mapped = mask.map(key => typeof key === "number" ? key.toString() : key)
  return new Set(mapped)
}

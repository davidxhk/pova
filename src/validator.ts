import type { AbortablePromise, ClassType, PrimitiveType, PrimitiveTypes, ValidationPlugin, ValidationResult, ValidatorProxy } from "./types"
import { $fixtures, $plugins, $promise, $proxy, $result } from "./symbols"
import { createReadonlyProxy, handleValidationError, isType, resolveValidationPlugin } from "./utils"

interface ValidationEventMap {
  validation: CustomEvent<ValidationResult>
}

export interface Validator {
  addEventListener<K extends keyof ValidationEventMap>(
    type: K,
    listener: (this: Validator, ev: ValidationEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void

  removeEventListener<K extends keyof ValidationEventMap>(
    type: K,
    listener: (this: Validator, ev: ValidationEventMap[K]) => void,
    options?: boolean | EventListenerOptions
  ): void

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void
}

export class Validator extends EventTarget {
  readonly [$proxy]: ValidatorProxy
  readonly [$fixtures]: { [key: PropertyKey]: any }
  readonly [$plugins]: ValidationPlugin[]
  [$promise]: AbortablePromise<ValidationResult | void> | null
  [$result]: ValidationResult | null

  constructor(fixtures: { [key: string]: any } = {}) {
    super()
    this[$proxy] = createReadonlyProxy(this, ["result", "hasFixture", "findFixture", "getFixture", "getFixtureValue", "dispatchResult"])
    this[$fixtures] = fixtures
    this[$plugins] = []
    this[$promise] = null
    this[$result] = null
  }

  get result(): Readonly<ValidationResult> | null {
    if (!this[$result]) {
      return null
    }

    return createReadonlyProxy(this[$result])
  }

  addFixture(fixture: any, name: PropertyKey = fixture?.name): void {
    if (!name) {
      throw new Error("Fixture must have a name")
    }
    if (this.hasFixture(name)) {
      throw new Error(`Fixture '${name.toString()}' already exists`)
    }
    this[$fixtures][name] = fixture
  }

  hasFixture(name: PropertyKey): boolean {
    return name in this[$fixtures]
  }

  findFixture(name: PropertyKey): any | undefined {
    if (this.hasFixture(name)) {
      return this[$fixtures][name]
    }
  }

  getFixture(name: PropertyKey): any
  getFixture<P extends PrimitiveType>(name: PropertyKey, options: { type: P }): PrimitiveTypes[P]
  getFixture<T>(name: PropertyKey, options: { type: ClassType<T> }): T
  getFixture(name: PropertyKey, options?: { type?: any }): any {
    const { type } = options || {}
    if (!this.hasFixture(name)) {
      throw new Error(`Fixture '${name.toString()}' not found`)
    }
    const fixture = this[$fixtures][name]
    if (type && !isType(fixture, type)) {
      switch (typeof type) {
        case "string":
          throw new TypeError(`Fixture '${name.toString()}' is not type ${type}`)
        case "function":
          throw new TypeError(`Fixture '${name.toString()}' is not an instance of ${type.name}`)
      }
    }
    return fixture
  }

  getFixtureValue(name: PropertyKey, options?: { key?: string }): any
  getFixtureValue<P extends PrimitiveType>(name: PropertyKey, options: { key?: string, type: P }): PrimitiveTypes[P]
  getFixtureValue<T>(name: PropertyKey, options: { key?: string, type: ClassType<T> }): T
  getFixtureValue(name: PropertyKey, options?: { key?: string, type?: any }): any {
    const { key = "value", type } = options || {}
    const fixture = this.getFixture(name)
    if (!(key in fixture)) {
      throw new Error(`Fixture '${name.toString()}' is missing a ${key}`)
    }
    const value = fixture[key]
    if (type && !isType(value, type)) {
      switch (typeof type) {
        case "string":
          throw new TypeError(`Fixture '${name.toString()}' ${key} is not type ${type}`)
        case "function":
          throw new TypeError(`Fixture '${name.toString()}' ${key} is not an instance of ${type.name}`)
      }
    }
    return value
  }

  removeFixture(name: PropertyKey): boolean
  removeFixture(fixture: any): boolean
  removeFixture(value: any): boolean {
    let name: PropertyKey | undefined
    if (!["string", "number", "symbol"].includes(typeof value)) {
      name = Object.keys(this[$fixtures]).find(name => this[$fixtures][name] === value)
    }
    else if (this.hasFixture(value)) {
      name = value
    }
    if (name === undefined) {
      return false
    }
    return delete this[$fixtures][name]
  }

  addPlugin(plugin: ValidationPlugin): void {
    this[$plugins].push(plugin)
  }

  removePlugin(plugin: ValidationPlugin): void {
    const index = this[$plugins].indexOf(plugin)
    if (index > -1) {
      this[$plugins].splice(index, 1)
    }
  }

  dispatchResult(result: ValidationResult | null): void {
    this[$result] = result
    this.dispatchEvent(new CustomEvent("validation", { detail: result }))
  }

  abort(reason?: string): void {
    if (this[$promise]) {
      this[$promise].abort(reason)
    }
  }

  reset(): void {
    this.abort("reset")
    this.dispatchResult(null)
  }

  async validate(trigger?: string): Promise<ValidationResult | null> {
    this.abort(`revalidation${trigger ? ` triggered by ${trigger}` : ""}`)
    let result = this[$result]

    for (const plugin of this[$plugins]) {
      try {
        this[$promise] = resolveValidationPlugin(plugin, { validator: this[$proxy], trigger, result })
        result = (await this[$promise]) || result
      }

      catch (error) {
        return handleValidationError(error)
      }

      finally {
        this[$promise] = null
      }
    }

    this.dispatchResult(result)
    return result
  }
}

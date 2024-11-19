import { AbortablePromise, AbortError } from "./utils"

export interface ValidationFixture {
  name: string
  value: string
}

export type ValidationPlugin = (
  validator: Validator,
  trigger: string | undefined,
  result: ValidationResult | null,
  signal: AbortSignal
) => ValidationResult | void | Promise<ValidationResult | void>

export type JSONValue = string | number | boolean | JSONValue[] | { [key: string]: JSONValue }

export interface ValidationResult {
  state: string
  message?: string
  [key: string]: JSONValue | undefined
}

export type ValidationEvent = CustomEvent<ValidationResult>

interface ValidationEventMap {
  validation: ValidationEvent
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
  readonly fixtures: ValidationFixture[]
  readonly plugins: ValidationPlugin[]
  result: ValidationResult | null
  promise: AbortablePromise<ValidationResult | void> | null

  constructor(fixtures?: ValidationFixture[], plugins?: ValidationPlugin[]) {
    super()
    this.fixtures = fixtures || []
    this.plugins = plugins || []
    this.result = null
    this.promise = null
  }

  addFixture(fixture: ValidationFixture): void {
    this.fixtures.push(fixture)
  }

  findFixture(name: string | number): ValidationFixture | undefined {
    if (typeof name === "string") {
      return this.fixtures.find(fixture => fixture.name === name)
    }
    else if (typeof name === "number") {
      return this.fixtures[name]
    }
  }

  removeFixture(fixture: ValidationFixture | string | number): void {
    let index = -1
    if (typeof fixture === "string") {
      index = this.fixtures.findIndex(f => f.name === fixture)
    }
    else if (typeof fixture === "number") {
      if (fixture >= 0 && fixture < this.fixtures.length) {
        index = fixture
      }
    }
    else {
      index = this.fixtures.findIndex(f => f === fixture)
    }
    if (index > -1) {
      this.fixtures.splice(index, 1)
    }
  }

  addPlugin(plugin: ValidationPlugin): void {
    this.plugins.push(plugin)
  }

  removePlugin(plugin: ValidationPlugin): void {
    const index = this.plugins.indexOf(plugin)
    if (index > -1) {
      this.plugins.splice(index, 1)
    }
  }

  setResult(result: ValidationResult | null): void {
    this.result = result
    this.dispatchEvent(new CustomEvent("validation", { detail: result }))
  }

  reset(): void {
    if (this.promise) {
      this.promise.abort("validation reset")
    }

    this.setResult(null)
  }

  async validate(trigger?: string): Promise<ValidationResult | null> {
    if (this.promise) {
      this.promise.abort(`${trigger} revalidation`)
    }

    let result = this.result
    for (const plugin of this.plugins) {
      try {
        const controller = new AbortController()
        const promise = plugin(this, trigger, result, controller.signal)
        this.promise = AbortablePromise.resolve(promise, controller)
        result = (await this.promise) || result
      }
      catch (error) {
        if (error instanceof AbortError) {
          return { state: "aborted", message: `${error}` }
        }
        if (error instanceof Error) {
          return { state: "error", message: `${error}` }
        }
        return { state: "unknown", message: JSON.stringify(error) }
      }
      finally {
        this.promise = null
      }
    }

    this.setResult(result)
    return result
  }
}

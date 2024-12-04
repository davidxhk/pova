import { AbortablePromise } from "./abortable-promise"
import { $fixtures, $plugins, $promise, $result } from "./symbols"

export interface ValidationFixture {
  name: string
  value: string
}

type Promisable<T> = T | PromiseLike<T>

export type ValidationPlugin = (
  validator: Validator,
  trigger: string | undefined,
  result: ValidationResult | null,
  signal: AbortSignal
) => Promisable<ValidationResult | void>

type JSONValue = string | number | boolean | JSONValue[] | { [key: string]: JSONValue }

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
  readonly [$fixtures]: ValidationFixture[]
  readonly [$plugins]: ValidationPlugin[]
  [$promise]: AbortablePromise<ValidationResult | void> | null
  [$result]: ValidationResult | null

  constructor(fixtures: ValidationFixture[] = [], plugins: ValidationPlugin[] = []) {
    super()
    this[$fixtures] = fixtures
    this[$plugins] = plugins
    this[$promise] = null
    this[$result] = null
  }

  addFixture(fixture: ValidationFixture): void {
    this[$fixtures].push(fixture)
  }

  findFixture(name: string | number): ValidationFixture | undefined {
    if (typeof name === "string") {
      return this[$fixtures].find(fixture => fixture.name === name)
    }
    else if (typeof name === "number") {
      return this[$fixtures][name]
    }
  }

  removeFixture(fixture: ValidationFixture | string | number): void {
    let index = -1
    if (typeof fixture === "string") {
      index = this[$fixtures].findIndex(f => f.name === fixture)
    }
    else if (typeof fixture === "number") {
      if (fixture >= 0 && fixture < this[$fixtures].length) {
        index = fixture
      }
    }
    else {
      index = this[$fixtures].findIndex(f => f === fixture)
    }
    if (index > -1) {
      this[$fixtures].splice(index, 1)
    }
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
    this.abort("validation reset")
    this.dispatchResult(null)
  }

  async validate(trigger?: string): Promise<ValidationResult | null> {
    this.abort(`${trigger} revalidation`)
    let result = this[$result]
    for (const plugin of this[$plugins]) {
      try {
        this[$promise] = new AbortablePromise(async (resolve, reject, controller) => {
          try {
            const pluginResult = await plugin(this, trigger, result, controller.signal)
            resolve(pluginResult)
          }
          catch (error) {
            reject(error)
          }
        })
        result = (await this[$promise]) || result
      }
      catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return { state: "aborted", message: `${error}` }
        }
        if (error instanceof Error) {
          return { state: "error", message: `${error}` }
        }
        return { state: "unknown", message: JSON.stringify(error) }
      }
      finally {
        this[$promise] = null
      }
    }
    this.dispatchResult(result)
    return result
  }
}

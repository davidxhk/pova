import { AbortablePromise, AbortError } from "./utils"

export interface ValidationFixture {
  name: string
  value: string
}

export type ValidationPlugin = (
  validator: Validator,
  trigger: string,
  result: ValidationResult,
  signal: AbortSignal
) => ValidationResult | void | Promise<ValidationResult | void>

export interface ValidationResult {
  state: string
  message: string
}

export interface ValidationOptions {
  exitOnPending?: boolean
  resetOnStart?: boolean
}

export const EMPTY_RESULT = Object.freeze<ValidationResult>({ state: "", message: "" })

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
  result: ValidationResult
  promise: AbortablePromise<ValidationResult | void> | null

  constructor(fixtures?: ValidationFixture[], plugins?: ValidationPlugin[]) {
    super()
    this.fixtures = fixtures || []
    this.plugins = plugins || []
    this.result = EMPTY_RESULT
    this.promise = null
  }

  addFixture(fixture: ValidationFixture): void {
    this.fixtures.push(fixture)
  }

  findFixture(name: string | number): ValidationFixture | undefined {
    if (typeof name === "number") {
      return this.fixtures[name]
    }
    else {
      return this.fixtures.find(fixture => fixture.name === name)
    }
  }

  removeFixture(fixture: ValidationFixture | string): void {
    let index = -1
    if (typeof fixture === "string") {
      index = this.fixtures.findIndex(f => f.name === fixture)
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

  setResult(result: ValidationResult): void {
    this.result = result
    this.dispatchEvent(new CustomEvent("validation", { detail: result }))
  }

  async validate(
    trigger: string = "",
    options?: ValidationOptions,
  ): Promise<ValidationResult> {
    if (options?.exitOnPending && this.result.state === "pending") {
      return this.result
    }
    if (this.promise) {
      this.promise.abort(`${trigger} revalidation`)
    }
    if (options?.resetOnStart) {
      this.setResult(EMPTY_RESULT)
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

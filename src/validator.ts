import { AbortablePromise } from "./abortable-promise"
import { createReadonlyProxy } from "./create-readonly-proxy"
import { $fixtures, $plugins, $promise, $proxy, $result } from "./symbols"

export type ValidatorProxy = Pick<Validator, "result" | "findFixture" | "getFixture" | "dispatchResult">

export interface ValidationFixture {
  name?: string
  value: string
}

export interface ValidationPluginProps {
  validator: ValidatorProxy
  trigger: string | undefined
  result: ValidationResult | null
  controller: AbortController
}

type Promisable<T> = T | PromiseLike<T>

export type ValidationPlugin = (props: ValidationPluginProps) => Promisable<ValidationResult | void>

type JSONValue = string | number | boolean | JSONValue[] | { [key: string]: JSONValue }

export interface ValidationResult {
  state: string
  message?: string
  payload?: JSONValue | undefined
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
  readonly [$proxy]: ValidatorProxy
  readonly [$fixtures]: Record<string, ValidationFixture>
  readonly [$plugins]: ValidationPlugin[]
  [$promise]: AbortablePromise<ValidationResult | void> | null
  [$result]: ValidationResult | null

  constructor(fixtures: Record<string, ValidationFixture> = {}, plugins: ValidationPlugin[] = []) {
    super()
    this[$proxy] = createReadonlyProxy(this, "result", "findFixture", "getFixture", "dispatchResult")
    this[$fixtures] = fixtures
    this[$plugins] = plugins
    this[$promise] = null
    this[$result] = null
  }

  get result(): ValidationResult | null {
    if (!this[$result]) {
      return null
    }
    const clone = Object.assign({}, this[$result])
    return Object.freeze(clone)
  }

  addFixture(fixture: ValidationFixture, name: string | undefined = fixture.name): void {
    if (!name) {
      throw new Error("Fixture must have a name")
    }
    if (name in this[$fixtures]) {
      throw new Error(`Fixture '${name}' already exists`)
    }
    this[$fixtures][name] = fixture
  }

  findFixture(name: string): ValidationFixture | undefined {
    return this[$fixtures][name]
  }

  getFixture(name: string): ValidationFixture {
    const fixture = this.findFixture(name)
    if (!fixture) {
      throw new Error(`Fixture '${name}' not found`)
    }
    return fixture
  }

  removeFixture(fixture: ValidationFixture | string): void {
    let name: string | undefined
    if (typeof fixture === "string") {
      if (fixture in this[$fixtures]) {
        name = fixture
      }
    }
    else {
      const entry = Object.entries(this[$fixtures]).find(entry => fixture === entry[1])
      if (entry) {
        name = entry[0]
      }
    }
    if (name) {
      delete this[$fixtures][name]
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
        result = handleValidationError(error)
        return result
      }
      finally {
        this[$promise] = null
      }
    }
    this.dispatchResult(result)
    return result
  }
}

function resolveValidationPlugin(plugin: ValidationPlugin, props: Omit<ValidationPluginProps, "controller">): AbortablePromise<ValidationResult | void> {
  return new AbortablePromise(async (resolve, reject, controller) => {
    try {
      const result = await plugin({ ...props, controller })
      resolve(result)
    }
    catch (error) {
      reject(error)
    }
  })
}

function handleValidationError(error: any): ValidationResult {
  if (error instanceof Error) {
    return { state: isAbortError(error) ? "aborted" : "error", message: `${error}` }
  }
  return { state: "unknown", message: JSON.stringify(error) }
}

function isAbortError(error: any): boolean {
  return error instanceof DOMException && error.name === "AbortError"
}

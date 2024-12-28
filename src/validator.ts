import type { AbortablePromise, FixtureStore, ValidationPlugin, ValidationResult } from "./types"
import { $fixtures, $plugins, $promise, $result } from "./symbols"
import { createFixturesProxy, createReadonlyProxy, createValidatorProxy, handleValidationError, resolveValidationPlugin } from "./utils"
import { ValidationSource } from "./validation-source"

export class Validator extends ValidationSource<ValidationResult | null> {
  readonly [$fixtures]: FixtureStore
  readonly [$plugins]: ValidationPlugin[]
  [$promise]: AbortablePromise<ValidationResult | void> | null
  [$result]: ValidationResult | null

  constructor(fixtures: FixtureStore) {
    super()
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
    this.dispatchValidationEvent(result)
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

    const fixtures = createFixturesProxy(this[$fixtures])
    const validator = createValidatorProxy(this)
    let result = this[$result]

    for (const plugin of this[$plugins]) {
      try {
        this[$promise] = resolveValidationPlugin(plugin, { fixtures, validator, trigger, result })
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

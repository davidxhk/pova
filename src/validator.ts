import type { AbortablePromise, FixtureStore, PartialFactoryProps, ValidationPlugin, ValidationResult } from "./types"
import { $fixtures, $plugins, $promise, $props, $result } from "./symbols"
import { createFixturesProxy, createReadonlyProxy, createValidatorProxy, handleValidationError, resolveValidationPlugin } from "./utils"
import { ValidationSource } from "./validation-source"

export class Validator<P extends PartialFactoryProps = {}> extends ValidationSource<ValidationResult | null> {
  readonly [$props]: P
  readonly [$fixtures]: FixtureStore
  readonly [$plugins]: ValidationPlugin[]
  [$promise]: AbortablePromise<ValidationResult | void> | null
  [$result]: ValidationResult | null

  constructor(fixtures: FixtureStore, defaultProps = {} as Readonly<P>) {
    super()
    this[$props] = defaultProps
    this[$fixtures] = fixtures
    this[$plugins] = []
    this[$promise] = null
    this[$result] = null
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

  get result(): Readonly<ValidationResult> | null {
    if (!this[$result]) {
      return null
    }

    return createReadonlyProxy(this[$result])
  }

  dispatchResult(result: ValidationResult | null): void {
    this[$result] = result
    this.dispatchValidationEvent(result)
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

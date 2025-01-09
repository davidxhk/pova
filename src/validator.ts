import type { AbortablePromise, DefaultPluginConfig, FixtureStore, PartialFactoryProps, PluginConfig, PluginRegistry, PluginRegistryLike, RegistryPluginConfig, ValidationPlugin, ValidationResult } from "./types"
import { $fixtures, $plugins, $promise, $props, $result } from "./symbols"
import { createFixturesProxy, createReadonlyProxy, createValidationPlugin, createValidatorProxy, handleValidationError, mergeObjects, resolveValidationPlugin } from "./utils"
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

  addPlugin(config: DefaultPluginConfig<P>): void
  addPlugin<K extends keyof T, T extends PluginRegistryLike<T>>(config: RegistryPluginConfig<K, T, P>, registry: PluginRegistry<T>): void
  addPlugin<K extends keyof T, T extends PluginRegistryLike<T>>(config: PluginConfig<K, T, P>, registry?: PluginRegistry<T>): void {
    const mergedConfig = mergeObjects(this[$props], config) as PluginConfig<K, T>
    this[$fixtures].addValidator(mergedConfig.fixture, this)

    const plugin = createValidationPlugin(mergedConfig, registry)
    this[$plugins].push(plugin)
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

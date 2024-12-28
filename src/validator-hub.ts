import type { FixtureStore, PartialFactoryProps, ValidatorEvent } from "./types"
import { $fixtures, $validators } from "./symbols"
import { ValidationSource } from "./validation-source"
import { Validator } from "./validator"

export class ValidatorHub extends ValidationSource<ValidatorEvent> {
  readonly [$fixtures]: FixtureStore
  readonly [$validators]: { [name: PropertyKey]: Validator }

  constructor(fixtures: FixtureStore) {
    super()
    this[$fixtures] = fixtures
    this[$validators] = {}
  }

  createValidator<P extends PartialFactoryProps = {}>(name: PropertyKey, defaultProps = {} as Readonly<P>): Validator<P> {
    if (this.hasValidator(name)) {
      throw new Error(`Validator '${name.toString()}' already exists`)
    }
    const validator = new Validator(this[$fixtures], defaultProps)
    this.dispatchValidationEvent({ name, type: "create" })
    validator.addEventListener("validation", (event) => {
      this.dispatchValidationEvent({ name, type: "result", result: event.detail })
    })
    this[$validators][name] = validator
    return validator
  }

  findValidator(name: PropertyKey): Validator | undefined {
    return this[$validators][name]
  }

  getValidator(name: PropertyKey): Validator {
    if (!this.hasValidator(name)) {
      throw new Error(`Validator '${name.toString()}' does not exist`)
    }

    return this[$validators][name]
  }

  getAllValidators(): Validator[] {
    return Object.values(this[$validators])
  }

  hasValidator(name: PropertyKey): boolean {
    return name in this[$validators]
  }

  removeValidator(name: PropertyKey): boolean {
    if (!this.hasValidator(name)) {
      return false
    }

    this.dispatchValidationEvent({ name, type: "remove" })
    return delete this[$validators][name]
  }
}

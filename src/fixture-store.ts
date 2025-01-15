import type { ClassType, NonEmptyArray, PrimitiveType, PrimitiveTypes, Validator } from "./types"
import { $fixtures, $validators } from "./symbols"
import { isPropertyKey, isType } from "./utils"

export class FixtureStore {
  readonly [$fixtures]: { [name: PropertyKey]: any }
  readonly [$validators]: { [name: PropertyKey]: Validator[] }

  constructor(fixtures: { [name: PropertyKey]: any } = {}) {
    this[$fixtures] = fixtures
    this[$validators] = {}
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

  addValidator(name: PropertyKey, validator: Validator): void {
    if (!(name in this[$validators])) {
      this[$validators][name] = []
    }

    const validators = this[$validators][name]

    if (validators.includes(validator)) {
      const index = validators.indexOf(validator)
      validators.splice(index)
    }

    validators.push(validator)
  }

  findFixture(name: PropertyKey): any | undefined {
    if (this.hasFixture(name)) {
      return this[$fixtures][name]
    }
  }

  getFixture(name: PropertyKey): any
  getFixture<P extends PrimitiveType>(name: PropertyKey, options: { type: P }): PrimitiveTypes[P]
  getFixture<T>(name: PropertyKey, options: { type: ClassType<T> }): T
  getFixture(name: PropertyKey, { type }: { type?: any } = {}): any {
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
  getFixtureValue(name: PropertyKey, { key = "value", type }: { key?: string, type?: any } = {}): any {
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

  getValidators(name: PropertyKey): NonEmptyArray<Validator> {
    if (!this.hasValidators(name)) {
      throw new Error(`Fixture '${name.toString()}' has no validators`)
    }

    return this[$validators][name] as NonEmptyArray<Validator>
  }

  hasFixture(name: PropertyKey): boolean {
    return name in this[$fixtures]
  }

  hasValidator(name: PropertyKey, validator: Validator): boolean {
    return name in this[$validators] && this[$validators][name].includes(validator)
  }

  hasValidators(name: PropertyKey): boolean {
    return name in this[$validators] && this[$validators][name].length > 0
  }

  removeFixture(name: PropertyKey): boolean
  removeFixture(fixture: any): boolean
  removeFixture(value: any): boolean {
    let name: PropertyKey | undefined

    if (!isPropertyKey(value)) {
      name = Reflect.ownKeys(this[$fixtures]).find(name => this[$fixtures][name] === value)
    }

    else if (this.hasFixture(value)) {
      name = value
    }

    if (name === undefined) {
      return false
    }

    return delete this[$fixtures][name]
  }

  removeValidator(validator: Validator, name?: PropertyKey): boolean {
    let names: PropertyKey[]

    if (name === undefined) {
      names = Reflect.ownKeys(this[$validators])
    }

    else if (name in this[$validators]) {
      names = [name]
    }

    else {
      return false
    }

    let removed = false

    for (const name of names) {
      const validators = this[$validators][name]
      const index = validators.indexOf(validator)

      if (index > -1) {
        const spliced = validators.splice(index, 1)
        removed ||= (spliced.length > 0)
      }
    }

    return removed
  }
}

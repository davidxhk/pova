import type { Validator } from "../types"

export function resetAll(validators: Iterable<Validator>): void {
  for (const validator of validators) {
    validator.reset()
  }
}

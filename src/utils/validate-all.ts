import type { ValidationResult, ValidationTarget, Validator } from "../types"
import { checkPreconditions } from "./check-preconditions"

export function validateAll(validators: Iterable<Validator<any>>, trigger: string, target?: ValidationTarget): Promise<(ValidationResult | null)[]> {
  const promises: Promise<ValidationResult | null>[] = []

  for (const validator of validators) {
    if (target && !checkPreconditions(validator, target)) {
      continue
    }

    const promise = validator.validate(trigger)
    promises.push(promise)
  }

  return Promise.all(promises)
}

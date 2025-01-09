import type { PluginProps, ValidationTarget } from "../types"
import { $fixtures } from "../symbols"
import { Validator } from "../validator"
import { matchesTarget } from "./matches-target"

export function checkPreconditions(validator: Validator<any>, target: ValidationTarget): boolean
export function checkPreconditions(props: PluginProps, target: ValidationTarget): boolean
export function checkPreconditions(validatorOrProps: Validator | PluginProps, target: ValidationTarget): boolean {
  let props: Partial<PluginProps> = {}
  if (validatorOrProps instanceof Validator) {
    const { [$fixtures]: fixtures, result } = validatorOrProps
    props = { fixtures, result }
  }
  else {
    props = validatorOrProps
  }

  const { fixtures, trigger, result, controller } = props
  const state = result?.state

  if (!fixtures?.hasFixture(target.fixture)) {
    return false
  }

  if (target.trigger && !matchesTarget(trigger, target.trigger)) {
    return false
  }

  if (target.state ? !matchesTarget(state, target.state) : state) {
    return false
  }

  if (controller?.signal.aborted) {
    return false
  }

  return true
}

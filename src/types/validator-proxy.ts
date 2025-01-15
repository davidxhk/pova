import type { Validator } from "../validator"

export type ValidatorProxy = Pick<Validator, "result" | "dispatchResult">

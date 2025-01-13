import type { PickPartial } from "./pick-partial"

export type PropsWithDefault<T extends object, P extends Partial<T>> = Omit<T, keyof P> & PickPartial<T, keyof P>

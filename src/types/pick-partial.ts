export type PickPartial<T, K extends keyof any> = { [P in Extract<keyof T, K>]?: T[P] }

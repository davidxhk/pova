export interface ClassType<T> {
  new (...args: any[]): T
  prototype: T
}

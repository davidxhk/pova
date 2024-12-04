import { $controller } from "./symbols"

export class AbortablePromise<T> extends Promise<T> {
  static get [Symbol.species](): any {
    return Promise
  }

  readonly [$controller]: AbortController

  constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void, controller: AbortController) => void) {
    const { promise, resolve, reject } = Promise.withResolvers<T>()
    super((resolve, reject) => promise.then(resolve).catch(reject))
    this[$controller] = new AbortController()
    this.signal.addEventListener("abort", () => {
      const error = new AbortError(this.signal.reason)
      reject(error)
    })
    executor(resolve, reject, this[$controller])
  }

  get signal(): AbortSignal {
    return this[$controller].signal
  }

  abort(reason?: any): void {
    return this[$controller].abort(reason)
  }
}

export class AbortError extends Error {
  reason?: any

  constructor(reason?: any) {
    super(typeof reason === "string" ? `aborted due to ${reason}` : "aborted")
    this.reason = reason
  }
}

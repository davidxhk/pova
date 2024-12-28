import { $controller } from "./symbols"
import { createAbortError } from "./utils"

export class AbortablePromise<T> extends Promise<T> {
  static get [Symbol.species](): PromiseConstructor {
    return Promise
  }

  readonly [$controller]: AbortController

  constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void, controller: AbortController) => void) {
    const { promise, resolve, reject } = Promise.withResolvers<T>()
    super((resolve, reject) => promise.then(resolve).catch(reject))
    this[$controller] = new AbortController()
    this.signal.addEventListener("abort", () => {
      const error = createAbortError(this.signal.reason)
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

import { $controller } from "./symbols"

export class AbortablePromise<T> extends Promise<T> {
  static get [Symbol.species](): any {
    return Promise
  }

  readonly [$controller]: AbortController

  constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void, controller: AbortController = new AbortController()) {
    const { signal } = controller
    super((resolve, reject) => {
      executor(resolve, reject)
      signal.addEventListener("abort", () => {
        const error = new AbortError(signal.reason)
        reject(error)
      })
    })
    this[$controller] = controller
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

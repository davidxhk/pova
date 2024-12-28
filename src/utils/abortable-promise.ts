import { $controller } from "../symbols"

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

function createAbortError(reason?: any): DOMException {
  if (!reason) {
    return new DOMException("signal is aborted without reason", "AbortError")
  }
  if (reason instanceof DOMException && reason.name === "AbortError") {
    return reason
  }
  if (reason instanceof Error) {
    return new DOMException(`${reason}`, "AbortError")
  }
  return new DOMException(JSON.stringify(reason), "AbortError")
}

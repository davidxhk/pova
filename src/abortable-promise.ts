export class AbortablePromise<T> extends Promise<T> {
  private readonly controller: AbortController

  constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void, controller: AbortController = new AbortController()) {
    const { signal } = controller
    super((resolve, reject) => {
      executor(resolve, reject)
      signal.addEventListener("abort", () => {
        const error = new AbortError(signal.reason)
        reject(error)
      })
    })
    this.controller = controller
  }

  get signal(): AbortSignal {
    return this.controller.signal
  }

  abort(reason?: any): void {
    return this.controller.abort(reason)
  }

  static resolve(): AbortablePromise<void>
  static resolve<T>(value: T, controller?: AbortController): AbortablePromise<Awaited<T>>
  static resolve<T>(value: T | PromiseLike<T>, controller?: AbortController): AbortablePromise<Awaited<T>>
  static resolve(value?: any, controller?: AbortController): AbortablePromise<any> {
    return new AbortablePromise((resolve, reject) => Promise.resolve(value).then(resolve).catch(reject), controller)
  }
}

export class AbortError extends Error {
  reason?: any

  constructor(reason?: any) {
    super(typeof reason === "string" ? `aborted due to ${reason}` : "aborted")
    this.reason = reason
  }
}

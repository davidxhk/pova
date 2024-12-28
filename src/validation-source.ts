export interface ValidationSource<T> {
  addEventListener(
    type: "validation",
    listener: (this: ValidationSource<T>, ev: CustomEvent<T>) => void,
    options?: boolean | AddEventListenerOptions
  ): void

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void

  removeEventListener(
    type: "validation",
    listener: (this: ValidationSource<T>, ev: CustomEvent<T>) => void,
    options?: boolean | EventListenerOptions
  ): void

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void
}

export class ValidationSource<T> extends EventTarget {
  dispatchValidationEvent(detail: T): boolean {
    const event = new CustomEvent<T>("validation", { detail })
    return this.dispatchEvent(event)
  }
}

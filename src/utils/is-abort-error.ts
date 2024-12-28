export function isAbortError(error: any): boolean {
  return error instanceof DOMException && error.name === "AbortError"
}

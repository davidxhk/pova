export function createAbortError(reason?: any): DOMException {
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

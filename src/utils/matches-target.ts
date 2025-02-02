import { isType } from "tstk"

export function matchesTarget(value: string | null | undefined, target: string | string[]): boolean {
  if (!value) {
    return false
  }

  const targets = isType(target, "string") ? target.split(",") : Array.from(target)

  const included = new Set()
  const excluded = new Set()

  for (const target of targets) {
    if (target.startsWith("!")) {
      excluded.add(target.slice(1))
    }

    else {
      included.add(target)
    }
  }

  return included.has(value) || (!excluded.has(value) && included.size === 0)
}

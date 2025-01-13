import type { JSONValue } from "./json-value"

export interface PluginFactoryProps {
  fixture: PropertyKey
  state?: string | string[]
  trigger?: string | string[]
  result: string
  message?: string
  payload?: JSONValue
}

import type { Json } from "tstk"

export interface PluginFactoryProps {
  fixture: PropertyKey
  state?: string | string[]
  trigger?: string | string[]
  result: string
  message?: string
  payload?: Json
}

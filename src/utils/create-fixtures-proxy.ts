import type { FixturesProxy, FixtureStore } from "../types"
import { createReadonlyProxy } from "./create-readonly-proxy"

export function createFixturesProxy(fixtures: FixtureStore): FixturesProxy {
  return createReadonlyProxy(fixtures, ["findFixture", "getFixture", "getFixtureValue", "hasFixture"])
}

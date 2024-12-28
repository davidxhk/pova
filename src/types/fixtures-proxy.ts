import type { FixtureStore } from "../fixture-store"

export type FixturesProxy = Pick<FixtureStore, "findFixture" | "getFixture" | "getFixtureValue" | "hasFixture">

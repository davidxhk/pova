import type { WithDefaults } from "tstk"
import type { PartialFactoryProps } from "./partial-factory-props"
import type { PluginFactoryProps } from "./plugin-factory-props"

export type DefaultPluginConfig<P extends PartialFactoryProps = {}> = { type?: never } & WithDefaults<PluginFactoryProps, P>

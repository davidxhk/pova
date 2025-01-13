import type { PartialFactoryProps } from "./partial-factory-props"
import type { PluginFactoryProps } from "./plugin-factory-props"
import type { PropsWithDefault } from "./props-with-default"

export type DefaultPluginConfig<P extends PartialFactoryProps = {}> = { type?: never } & PropsWithDefault<PluginFactoryProps, P>

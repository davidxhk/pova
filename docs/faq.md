## Frequently Asked Questions

### About validation plugins

[validation plugin]: #validation-plugin
[validation plugins]: #validation-plugin
- What is a <a name="validation-plugin">validation plugin</a>?\
  A [`ValidationPlugin`](../src/types/validation-plugin.ts) is a _function_ that accepts [plugin props] and may or may not return a [validation result]. It is used by a [validator] to conduct validation. It can also be an _async function_.

[plugin props]: #plugin-props
- What are <a name="plugin-props">plugin props</a>?\
  [`PluginProps`](../src/types/plugin-props.ts) are props used by a [validation plugin] to conduct validation.

[validation result]: #validation-result
[validation results]: #validation-result
- What is a <a name="validation-result">validation result</a>?\
  A [`ValidationResult`](../src/types/validation-result.ts) is an _object_ that contains the outcome of a validation process.

[create a validation plugin]: #create-validation-plugin
[creating a validation plugin]: #create-validation-plugin
- How are <a name="create-validation-plugin">validation plugins created</a>?\
  A [validation plugin] is [created](../src/utils/create-validation-plugin.ts) using a [plugin config] and a [plugin registry]. If the plugin config contains a "type", then a [plugin factory] is selected from the plugin registry to [create a factory plugin]. Otherwise, the [default factory plugin] is used. The plugin config is also used to define a [validation target] and a [default validation result].

  | Object                    | Purpose                                                                     |
  | ------------------------- | --------------------------------------------------------------------------  |
  | Factory plugin            | Conduct validation using [plugin props].                                    |
  | Validation target         | Check for [validation preconditions] before the factory plugin is called.   |
  | Default validation result | Substitute as the [validation result] if the factory plugin returns "true". |

### About plugin configs

[plugin config]: #plugin-config
- What is a <a name="plugin-config">plugin config</a>?\
  A [`PluginConfig`](../src/types/plugin-config.ts) is an _object_ which includes an optional "type" along with [plugin factory props] and other custom props. It is used with a [plugin registry] to [create a validation plugin].

[default factory plugin]: #default-factory-plugin
- What is the <a name="default-factory-plugin">default factory plugin</a>?\
  The [default factory plugin](../src/utils/get-factory-plugin.ts#L3) is a [factory plugin] which only returns "true", i.e., it _always_ uses the [default validation result].

### About plugin registries

[plugin registry]: #plugin-registry
- What is a <a name="plugin-registry">plugin registry</a>?\
  A [`PluginRegistry`](../src/plugin-registry.ts) is a _class_ which contains [plugin factories]. It is used with a [plugin config] to [create a validation plugin].

[plugin factory]: #plugin-factory
[plugin factories]: #plugin-factory
- What is a <a name="plugin-factory">plugin factory</a>?\
  A [`PluginFactory`](../src/types/plugin-factory.ts) is a _function_ that accepts [plugin factory props] and returns a [factory plugin]. It can also accept other custom props.

[plugin factory props]: #plugin-factory-props
- What are <a name="plugin-factory-props">plugin factory props</a>?\
  [`PluginFactoryProps`](../src/types/plugin-factory-props.ts) are props used by a [plugin factory] to create a [factory plugin]. They include props necessary to define a [validation target] and the [default validation result].

### About factory plugins

[factory plugin]: #factory-plugin
[factory plugins]: #factory-plugin
- What is a <a name="factory-plugin">factory plugin</a>?\
  A [`FactoryPlugin`](../src/types/factory-plugin.ts) is a _function_ similar to a [validation plugin] that may also return a _boolean_. If it is "true", then the [default validation result] will be used. It is involved in [creating a validation plugin].

[default validation result]: #default-validation-result
- What is the <a name="default-validation-result">default validation result</a>?\
  The [default validation result](../src/utils/get-default-result.ts) is the [validation result] used when a [factory plugin] returns "true". It comes from the [plugin factory props] that were used to [create the factory plugin]. It is involved in [creating a validation plugin].

[create a factory plugin]: #create-factory-plugin
[create the factory plugin]: #create-factory-plugin
- How are <a name="create-factory-plugin">factory plugins created</a>?\
  A [factory plugin] is created by passing [plugin factory props] and other custom props into a [plugin factory].

### About fixtures

[fixture]: #fixture
[fixtures]: #fixture
- What is a <a name="fixture">fixture</a>?\
  A fixture can be ***any*** _object_ such as a form control or a custom data source.

[fixture store]: #fixture-store
- What is a <a name="fixture-store">fixture store</a>?\
  A [`FixtureStore`](../src/fixture-store.ts) is a _class_ that holds all [fixtures] in one place. It is used by a [validator] to conduct validation.

### About validators

[validator]: #validator
[validators]: #validator
- What is a <a name="validator">validator</a>?\
  A [`Validator`](../src/validator.ts) is a _class_ that conducts validation using a [fixture store] and a set of [validation plugins].

- How do <a name="validators-linked-to-fixtures">validators get linked to fixtures</a>?\
  Adding a plugin to a [validator] using a [plugin config] **automatically** associates the validator with the target fixture in the validator's [fixture store].

[validator hub]: #validator-hub
[validator hubs]: #validator-hub
- What is a <a name="validator-hub">validator hub</a>?\
  A [`ValidatorHub`](../src/validator-hub.ts) is a _class_ that helps manage multiple [validators] in one place.

- What is the <a name="validator-vs-validator-hub">difference between a validator and a validator hub</a>?\
  Both [validators] and [validator hubs] emit custom "validation" events, but with different details—validators emit [validation results] while validator hubs emit [validator events].

  | Event Target   | Event Type     | Event Detail               | Purpose                                     |
  | -------------- | -------------- | -------------------------- | ------------------------------------------- |
  | `Validator`    | `"validation"` | `ValidationResult \| null` | Report the outcome of a validation process. |
  | `ValidatorHub` | `"validation"` | `ValidatorEvent`           | Report a lifecycle event of a validator.    |

[validator event]: #validator-event
[validator events]: #validator-event
- What is a <a name="validator-event">validator event</a>?\
  A [`ValidatorEvent`](../src/types/validator-event.ts) is an _object_ that is emitted by a [validator hub] when a [validator] is created, removed, or emits a [validation result].

### About validation targets

[validation target]: #validation-target
- What is a <a name="validation-target">validation target</a>?\
  A [`ValidationTarget`](../src/types/validation-target.ts) is an _object_ used to check for [validation preconditions] through [target matching]. It is involved in [creating a validation plugin].

[validation preconditions]: #validation-preconditions
- What are <a name="validation-preconditions">validation preconditions</a>?\
  [Validation preconditions](../src/utils/check-preconditions.ts) are criteria defined by a [validation target] that determine whether or not validation should proceed. One criteria that is **always** checked is that the validation controller must not be aborted.

  | Target                     | Criteria                                                                   |
  | -------------------------- | -------------------------------------------------------------------------- |
  | "fixture" (required)       | The fixture store must contain the target fixture.                         |
  | "trigger" (optional)       | The validation trigger must [match with the target] trigger.               |
  | "state" (optional)         | The current validation state must [match with the target] state.           |
  | "state" is _undefined_     | There must be no current validation result.                                |

[target matching]: #target-matching
[match with the target]: #target-matching
- How does <a name="target-matching">target matching</a> work?\
  In [target matching](../src/utils/matches-target.ts), a value is compared against a target, which can be either an _array_ or a comma-separated _string_ of target strings. A match is found if the value is equal to any of the target strings. If a target string is prefixed with "!", the result is negated instead.

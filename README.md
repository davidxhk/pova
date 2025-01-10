# pova

pova is the <ins>p</ins>lugin-<ins>o</ins>riented <ins>va</ins>lidation framework for building great forms with real-time user feedback.

Whether you’re crafting a simple sign-up form or a complex multi-step wizard, pova offers a **simple yet powerful approach** to client-side form validation with no external dependencies required.

## Key Features

🎯 ***Straightforward, intuitive process***\
pova is designed to minimize complexity and reduce cognitive load to help you streamline your validation workflow.

🔌 ***Extensible plugin-based architecture***\
pova allows you to tap into an ecosystem of plugin libraries or configure your own custom plugins to handle a wide range of tasks.

📋 ***Declarative object-based validation***\
pova enables you to describe your validation rules using plain old JavaScript objects, promoting clean and maintainable code.

🟦 ***First-class TypeScript support***\
pova provides full TypeScript support to power IntelliSense suggestions for all the plugins that you have defined.

## Installation

Install `pova` and its default plugin library, `pova-plugins` (optional), using your preferred package manager:

```bash
npm install pova pova-plugins
```

## Quick Start

### 1. Define your plugin registry

Import a plugin library into your [plugin registry](docs/faq.md#plugin-registry):

```typescript
import { defineRegistry } from "pova"
import * as defaultPlugins from "pova-plugins"

const pluginRegistry = defineRegistry({ ...defaultPlugins })
```

and/or create your own [plugin factories](docs/faq.md#plugin-factory):

```typescript
import { defineRegistry } from "pova"
import * as defaultPlugins from "pova-plugins"

const pluginRegistry = defineRegistry({
  ...defaultPlugins,

  required({ fixture }) {
    return ({ fixtures }) => {
      const value = fixtures.getFixtureValue(fixture)
      return value === ""
    }
  },
})
```

### 2. Create a fixture store

Create an empty [fixture store](docs/faq.md#fixture-store):

```typescript
import { FixtureStore } from "pova"

const fixtureStore = new FixtureStore()
```

or provide some initial [fixtures](docs/faq.md#fixture):

```typescript
import { FixtureStore } from "pova"

const initialFixtures = {
  email: {
    value: "test@example.com"
  }
}

const fixtureStore = new FixtureStore(initialFixtures)
```

### 3. Add fixtures to your fixture store

Add an object that has a name:

```typescript
const usernameInput = document.querySelector("input[name='username']")

fixtureStore.addFixture(usernameInput)
```

or provide a custom name:

```typescript
const passwordInput = document.querySelector("input[type='password']")

fixtureStore.addFixture(passwordInput, "password")
```

### 4. Create a validator

Create a [validator](docs/faq.md#validator) using your fixture store:

```typescript
import { Validator } from "pova"

const validator = new Validator(fixtureStore)
```

or use a [validator hub](docs/faq.md#validator-hub) to create one with a name:

```typescript
import { ValidatorHub } from "pova"

const validatorHub = new ValidatorHub(fixtureStore)

const usernameValidator = validatorHub.createValidator("username")
```

### 5. Add plugins to your validator

Add a plugin using a [plugin config](docs/faq.md#plugin-config) and your plugin registry:

```typescript
usernameValidator.addPlugin({
  type: "required",
  fixture: "username",
  result: "invalid",
  message: "Please enter your username."
}, pluginRegistry)
```

or add multiple plugins with default [plugin factory props](docs/faq.md#plugin-factory-props):

```typescript
const defaultProps = {
  fixture: "username",
  result: "invalid"
}

usernameValidator.addPlugins([
  { type: "required", message: "Please enter your username." },
  { type: "length", gt: 8, message: "Username must be longer than 8 characters." },
  { result: "valid" }
], pluginRegistry, defaultProps)
```

which can also be provided when creating a validator:

```typescript
const defaultProps = {
  fixture: "username",
  result: "invalid"
}

const usernameValidator = new Validator(fixtureStore, defaultProps)

usernameValidator.addPlugins([
  { type: "required", message: "Please enter your username." },
  { type: "length", gt: 8, message: "Username must be longer than 8 characters." },
  { result: "valid" }
], pluginRegistry)
```

### 6. Setup validation triggers

Trigger a single validator:

```typescript
usernameInput.addEventListener("input", () => {
  usernameValidator.reset()
  usernameValidator.validate("input")
})
```

or [validators linked to a fixture](docs/faq.md#validators-linked-to-fixtures):

```typescript
import { resetAll, validateAll } from "pova"

passwordInput.addEventListener("input", () => {
  const passwordValidators = fixtureStore.getValidators("password")
  resetAll(passwordValidators)
  validateAll(passwordValidators, "input")
})
```

or validators from a validator hub:

```typescript
import { validateAll } from "pova"

form.addEventListener("blur", (event) => {
  const allValidators = validatorHub.getAllValidators()
  validateAll(allValidators, "blur")
})
```

### 7. Handle validation events

Handle [validation results](docs/faq.md#validation-result) emitted by a validator:

```typescript
usernameValidator.addEventListener("validation", (event) => {
  const { state, message } = event.detail ?? {}
  usernameMessage.innerHTML = message || ""
  switch (state) {
    case "invalid":
      usernameInput.style.borderColor = "red"
      break
    case "valid":
      usernameInput.style.borderColor = "green"
      break
    default:
      usernameInput.style.borderColor = "initial"
      break
  }
})
```

or [validator events](docs/faq.md#validator-event) emitted by a validator hub:

```typescript
validatorHub.addEventListener("validation", (event) => {
  const { name, type } = event.detail
  switch (type) {
    case "create":
      console.log(`Validator ${name} was created`)
      break
    case "remove":
      console.log(`Validator ${name} was removed`)
      break
    case "result":
      console.log(`Validator ${name} emitted a result: ${event.detail.result}`)
      break
  }
})
```

## Learn More

### Examples

[Server-side email validation](docs/examples/01-server-side-email-validation.md)\
See how to combine server-side checks and debouncing for a smooth email validation experience.

### Frequently Asked Questions

Explore common questions in the [FAQ](docs/faq.md).

> [!WARNING]
>
> Malicious users can always bypass client-side checks. Remember to **validate data on the server side** as well.

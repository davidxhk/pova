# `pova`
> Flexible validation framework for modern JavaScript apps.

In today’s digital landscape, real-time feedback is crucial for enhancing user experience and boosting conversion rates. Achieving this often requires validation on both the client-side and server-side. However, with the rise of server-side rendering in frameworks such as React, this task has become increasingly complex. That’s why I decided to build `pova` — a tiny but versatile framework for developing validation pipelines that work seamlessly across the client and the server.

`pova` (**P**lugin-**O**riented **VA**lidation) is a lightweight, plugin-based validation framework designed for maximum flexibility and extensibility. Inspired by dependency injection and inversion of control, `pova` gives you full ownership of the validation process unlike other validation libraries that abstract away the validation logic. You control every stage of validation with your own plugins, and handle validation state changes with your own event listeners. Most importantly, `pova` is built with vanilla JavaScript, so it can be incorporated into any JavaScript framework.

## Quick Start

Install via npm:

```bash
npm install pova
```

Create `Validator` instance:

```javascript
import { Validator } from "pova"

const validator = new Validator()
```

Register fixture(s):

```javascript
const usernameInput = document.getElementById("username")

// Register HTMLInputElement as fixture
validator.addFixture(usernameInput)
```

Define validation logic within plugin(s):

```javascript
validator.addPlugin((validator, trigger, result) => {
  if (result.state) {
    return // Exit if state has been determined
  }

  const fixture = validator.findFixture("username")
  if (!fixture) {
    throw new Error("Fixture not found")
  }

  const username = fixture.value
  if (username.length < 3) {
    return { state: "invalid", message: "Username must be at least 3 characters." }
  }
})
```

Use event listeners to trigger validations and respond to changes in validation state:

```javascript
// Validate on input event
usernameInput.addEventListener("input", () => {
  validator.validate("input", {
    resetOnStart: true // Dispatch empty result before validating
  })
})

const submitButton = document.getElementById("submit")

// Disable submit button on invalid state
validator.addEventListener("validation", (event) => {
  submitButton.disabled = event.detail.state === "invalid"
})
```

## Key Features

- **Flexible Fixture System**: Register any form control element or custom object as a fixture to access it during validation. Validate any data source in real-time.

- **Modular Plugin Architecture**: Add synchronous or asynchronous plugins to tailor your custom validation pipeline. Handle anything from simple validations to complex multi-input checks or server requests, even with debouncing.

- **Event-Driven State Management**: Use event listeners to capture and handle real-time validation changes. Update your components with the latest validation state and avoid issues like stale data or excessive re-renders.

- **Framework-Agnostic**: Integrate with any JavaScript framework or even vanilla JS. Zero dependencies required.

## Core Concepts

### Fixtures

- **Definition**: Fixtures are objects with a unique `name` and a value, e.g., form control elements such as `HTMLInputElement` or custom data sources.

- **Purpose**: Fixtures enable plugins to dynamically access multiple data sources in one place during validation.

- **Usage**: Register fixtures with `validator.addFixture()` to make them available to plugins.

### Plugins
- **Definition**: Plugins are middleware that are executed sequentially during validation.

- **Purpose**: Plugins perform simple or complex validation tasks, synchronously or asynchronously, to determine the final validation result.

- **Arguments**: Each plugin has access to the following arguments:
  1. **validator**: To access fixtures via `validator.findFixture()`.

  2. **trigger**: To check what triggered the validation.

  3. **current result**: To access the current validation state.

  4. **abort signal**: To handle interruptions\* during execution.

      \* See [abortable promises](#abortable-promises) to learn more.

- **Usage**: Register plugins with `validator.addPlugin()` to include them in the validation process.

### Abortable Promises
- **Definition**: Abortable promises are promises that can be aborted during execution.

- **Purpose**: Abortable promises are used to resolve each plugin during validation.

- **Context**: When a new validation process begins, any plugin that is currently running will be aborted. The abort signal can be used to implement **debouncing**.

- **Debouncing**\*: Before expensive operations such as server requests, add a *debounce delay*, then check the abort signal. If the signal has been aborted, skip the operation.

  \* See [this example](#example-debouncing-server-requests) to learn more.

### Event-Driven State Management

- **Definition**: Event-driven state management is a way of handling state updates by sending out custom events whenever the state changes. Components listen for these events to receive the latest state and decide how to respond.

- **Benefits**:

  1. **Efficiency**: No complex state management required. Components that rely on the validation state are automatically updated.

  2. **Performance**: Minimize unnecessary re-renders. Only components that rely on the validation state are updated.

  3. **Flexibility**: Build rich validation interfaces with highly decoupled components. Components can handle validation state updates in their own way without affecting other components.

## Example: Asynchronous Validation

This example demonstrates how to use `pova` for asynchronous server-side validation, such as checking the availability of an email address.

```javascript
import { Validator } from "pova"

const validator = new Validator()

const emailInput = document.getElementById("email")

validator.addFixture(emailInput)

validator.addPlugin(async (validator, trigger, result, signal) => {
  if (result.state) {
    return
  }

  const fixture = validator.findFixture("email")
  if (!fixture) {
    throw new Error("Fixture not found")
  }

  // Basic email format validation
  const email = fixture.value
  if (!EMAIL_REGEX.test(email)) {
    return { state: "invalid", message: "Enter a valid email address." }
  }

  // Dispatch pending result to provide user feedback
  validator.setResult({ state: "pending", message: "Checking availability..." })

  // Server request to check email availability
  const response = await fetch(`/check-availability?email=${email}`).then(res => res.json())
  if (!response.isAvailable) {
    return { state: "invalid", message: "Email is already in use." }
  }

  return { state: "valid", message: "Email is available." }
})

// Validate on input event
emailInput.addEventListener("input", () => {
  validator.validate("input", { resetOnStart: true })
})
```

In this example:

- **Fixture:** The email input is registered as a fixture.

- **Plugin:** A plugin is added to validate the email format and make an async server request to check if the email is available.

- **Event binding:** The validation is triggered on input events, allowing real-time validation feedback.

## Example: Debouncing Server Requests

This example demonstrates how to use `pova` to debounce server requests until the user stops typing to minimize server load and improve responsiveness.

```javascript
import { Validator } from "pova"

const validator = new Validator()

const emailInput = document.getElementById("email")

validator.addFixture(emailInput)

validator.addPlugin(async (validator, trigger, result, signal) => {
  if (result.state) {
    return
  }

  const fixture = validator.findFixture("email")
  if (!fixture) {
    throw new Error("Fixture not found")
  }

  const email = fixture.value
  if (!EMAIL_REGEX.test(email)) {
    return { state: "invalid", message: "Please enter a valid email address." }
  }

  // Add a debounce delay before checking availability
  await new Promise(resolve => setTimeout(resolve, 500))

  // Exit early if the plugin has been aborted
  if (signal.aborted) {
    return
  }

  validator.setResult({ state: "pending", message: "Checking availability..." })

  const response = await fetch(`/check-availability?email=${email}`).then(res => res.json())
  if (!response.isAvailable) {
    return { state: "invalid", message: "Email is already in use." }
  }

  return { state: "valid", message: "Email is available." }
})

emailInput.addEventListener("input", () => {
  validator.validate("input", { resetOnStart: true })
})
```

What changed in this example:

- **Delay:** A debounce delay of 500ms is introduced before the server request to give the user time to stop typing.

- **Early exit:** If the user inputs during the delay, the signal will be aborted, allowing the plugin to exit early and skip the server request.

## Conclusion

`pova` offers a flexible, framework-agnostic approach to input validation, allowing you to implement custom workflows that fit the needs of your application. Whether you need simple field validation, complex multi-field checks, or debounced server requests, `pova` gives you complete control over how you want your validation to be like.

Ready to get started? Check out the [**Quick Start**](#quick-start) section above to see how to integrate `pova` into your project. If you have any questions or need further assistance, feel free to open an issue on the [issues page](https://github.com/davidxhk/pova/issues).

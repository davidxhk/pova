# `pova`

> Flexible validation for interactive forms

`pova` (**P**lugin-**O**riented **VA**lidation) is a lightweight, plugin-based validation framework for building interactive forms with real-time feedback.

With `pova`, you can easily create flexible and extensible validation pipelines to handle even your most complex validation requirements.

`pova` gives you full control of your validation process, and allows you to conduct validation on the server-side seamlessly.

Start building interactive forms today with `pova`.

## Key Features

- **Flexible Fixture System**: Register any form control element or custom object as a [fixture](#fixtures) to access it during validation. Validate any data source in real-time.

- **Modular Plugin Architecture**: Tailor your custom validation pipeline with synchronous or asynchronous [plugins](#plugins). Handle anything from simple validations to complex multi-input checks and [server requests](#example-asynchronous-validation), and even [with debouncing](#example-debouncing-server-requests).

- **Event-Driven State Management**: Capture and handle real-time validation changes with [event listeners](#event-driven-state-management). Update your components with the latest validation state and avoid issues like stale data or excessive re-renders.

- **Framework-Agnostic**: Integrate with any JavaScript framework or even vanilla JS. Zero dependencies required.

## Quick Start

1. Install via npm:

```bash
npm install pova
```

2. Create `Validator` instance:

```javascript
import { Validator } from "pova"

const validator = new Validator()
```

3. Register [fixture(s)](#fixtures):

```javascript
const usernameInput = document.getElementById("username")

validator.addFixture(usernameInput)
```

4. Define validation logic within [plugin(s)](#plugins):

```javascript
validator.addPlugin((validator, trigger, result) => {
  // Exit if state has been determined
  if (result.state) {
    return
  }

  // Access fixture
  const fixture = validator.findFixture("username")
  if (!fixture) {
    throw new Error("Fixture not found")
  }

  // Check username length
  const username = fixture.value
  if (username.length < 3) {
    return { state: "invalid", message: "Username must be at least 3 characters." }
  }
})
```

5. Use [event listeners](#event-driven-state-management) to trigger validations and respond to changes in validation state:

```javascript
// Validate on input event
usernameInput.addEventListener("input", () => {
  // Clear previous result
  validator.reset()

  // Trigger validation
  validator.validate("input")
})

const message = document.getElementById("message")

// Update username message on validation
validator.addEventListener("validation", (event) => {
  message.innerHTML = event.detail.message
})
```

## Core Concepts

### Fixtures

- **Definition**: Fixtures are objects with a unique `name` and a value, e.g., form control elements such as `HTMLInputElement` or custom data sources.

- **Purpose**: Fixtures enable plugins to dynamically access multiple data sources in one place during validation.

- **Usage**: Register fixtures with `validator.addFixture()` to make them available for validation.

### Plugins

- **Definition**: Plugins are middleware that are executed sequentially during validation.

- **Purpose**: Plugins perform simple or complex validation tasks, synchronously or asynchronously, to determine the final validation result.

- **Arguments**: Each plugin has access to the following arguments:

  1. **validator**: To access fixtures via `validator.findFixture()`.

  2. **trigger**: To check what triggered the validation.

  3. **current result**: To access the current validation state.

  4. **abort signal**: To handle interruptions\* during execution.

      \* See [abortable promises](#abortable-promises) to learn more.

- **Usage**: Register plugins with `validator.addPlugin()` to add them to the validation process.

### Abortable Promises

- **Definition**: Abortable promises are promises that can be aborted during execution.

- **Purpose**: Abortable promises are used to resolve each plugin during validation.

- **Context**: When a new validation process begins, any plugin that is currently running will be aborted. The abort signal can be used to implement **debouncing**\*.

  \* See [this example](#example-debouncing-server-requests) to learn more.

### Event-Driven State Management

- **Definition**: Event-driven state management is a way of handling state updates by sending out custom events whenever the state changes.

- **Purpose**: Components can listen for and act on state changes using event listeners.

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

  // Check email format using regex
  const email = fixture.value
  if (!EMAIL_REGEX.test(email)) {
    return { state: "invalid", message: "Enter a valid email address." }
  }

  // Display pending message
  validator.dispatchResult({ state: "pending", message: "Checking availability..." })

  // Check email availability with server request
  const response = await fetch(`/check-availability?email=${email}`).then(res => res.json())
  if (!response.isAvailable) {
    return { state: "invalid", message: "Email is already in use." }
  }

  return { state: "valid", message: "Email is available." }
})

emailInput.addEventListener("input", () => {
  validator.reset()
  validator.validate("input")
})

const message = document.getElementById("message")
validator.addEventListener("validation", (event) => {
  message.innerHTML = event.detail.message
})
```

In this example:

- **Fixture**: The email input is registered as a [fixture](#fixtures).

- **Plugin**: A [plugin](#plugins) is added to validate the email format and make a server request to check if the email is available.

- **Validation trigger**: Input events are used to trigger validation to enable real-time feedback.

- **State management**: The email message is updated on validation to provide immediate feedback.

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

  validator.dispatchResult({ state: "pending", message: "Checking availability..." })

  const response = await fetch(`/check-availability?email=${email}`).then(res => res.json())
  if (!response.isAvailable) {
    return { state: "invalid", message: "Email is already in use." }
  }

  return { state: "valid", message: "Email is available." }
})

emailInput.addEventListener("input", () => {
  validator.reset()
  validator.validate("input")
})

const message = document.getElementById("message")
validator.addEventListener("validation", (event) => {
  message.innerHTML = event.detail.message
})
```

What changed in this example:

- **Delay**: A debounce delay of 500ms is introduced before the server request to give the user time to stop typing.

- **Early exit**: If the user inputs during the delay, the signal will be aborted, allowing the plugin to exit early and skip the server request.

## Conclusion

`pova` offers a flexible, framework-agnostic approach to form validation, allowing you to implement custom workflows that fit the needs of your application. Whether you need simple field validation, complex multi-field checks, or debounced server requests, `pova` gives you complete control over how you want your validation to be like.

Ready to get started? Check out the [**Quick Start**](#quick-start) section above to see how to integrate `pova` into your project. If you have any questions or need further assistance, feel free to open an issue on the [issues page](https://github.com/davidxhk/pova/issues).

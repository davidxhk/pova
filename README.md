# `pova`

> **Plugin-Oriented Validation Framework**

`pova` is a lightweight, plugin-based validation framework designed for maximum flexibility and extensibility. Built with vanilla JavaScript, `pova` can be adapted to work seamlessly with any JavaScript framework—whether it’s React, Vue, or none at all.

Inspired by principles of dependency injection and inversion of control, `pova` enables you to build any validation workflow that caters to your needs. Customize every stage of validation with your own plugins, and handle validation state changes with your own event listeners. With `pova`, you have complete control over your app's validation, allowing you to create dynamic, efficient, and highly maintainable validation logic that scales with your application.

## Key Features

- **Flexible Fixture System:** Register any form element or custom object as a fixture and access it dynamically during validation. Fixtures provide a convenient way to manage and validate data sources across your form.
- **Modular Plugin Architecture:** Add synchronous or asynchronous plugins to tailor your custom validation pipeline. With access to all fixtures, an abort signal, and more, `pova` supports everything from simple validations to complex, multi-input checks and debounced server requests.
- **Event-Driven State Management:** Use event listeners to capture real-time validation changes, ensuring the DOM stays in sync with the latest validation state, free from issues like stale data or redundant renders.
- **Framework-Agnostic:** Built on vanilla JavaScript, `pova` integrates seamlessly with any JavaScript framework—or no framework at all.

## Quick Start

Install via npm:

```bash
npm install pova
```

Define your validation logic through fixtures and plugins:

```javascript
import { Validator } from "pova"

// Create a validator instance and register form elements as fixtures
const validator = new Validator()
const usernameInput = document.getElementById("username")
validator.addFixture(usernameInput)

// Add validation plugins
validator.addPlugin((validator, trigger, result) => {
  if (result.state) {
    return // Skip if already invalid
  }
  const fixture = validator.findFixture("email")
  if (!fixture) {
    throw new Error("Fixture not found")
  }

  const username = fixture.value
  if (username.length < 3) {
    return { state: "invalid", message: "Username must be at least 3 characters." }
  }
})

// Trigger validation on input events
usernameInput.addEventListener("input", () => validator.validate("input", { resetOnStart: true }))

// Respond to validation state changes
const submitButton = document.getElementById("submit")
validator.addEventListener("validation", (event) => {
  submitButton.disabled = event.detail.state === "invalid"
})
```

## Core Concepts

### Fixtures
Fixtures are objects with a unique `name` and a value, like form elements or custom data sources. They enable plugins to dynamically access multiple data sources in one place during validation. Register fixtures with `validator.addFixture()` to make them available to plugins.

### Plugins
Plugins are middleware that execute sequentially to determine the final validation result. Each plugin can perform simple or complex tasks, synchronously or asynchronously, using its provided arguments: the validator to access fixtures, the trigger to check context, the previous result to manage validation, and the abort signal to handle interruptions. Register plugins with `validator.addPlugin()` to include them in the validation process.

### Abortable Promises
`validator.validate()` first cancels any running plugins, then resolves all plugins using abortable promises. Plugins can use the abort signal to skip unnecessary actions, such as server calls, if interrupted. This optimization is particularly useful to debounce complex or server-bound operations for efficient real-time validation.

### Event-Driven State Management
State management in `pova` is driven by validation events, allowing components to stay synchronized with the latest validation results through event listeners. This event-driven approach removes the need for manual state updates and prevents unnecessary re-renders. Additionally, multiple listeners can operate independently, enabling different components to respond uniquely to state changes.

## Example Usage: Asynchronous Validation

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

  // Server request to check email availability
  validator.setResult({ state: "pending", message: "Checking availability..." })
  const response = await fetch(`/check-availability?email=${email}`).then(res => res.json())
  if (!response.isAvailable) {
    return { state: "invalid", message: "Email is already in use." }
  }

  return { state: "valid", message: "Email is available." }
})

// Bind validation to input events
emailInput.addEventListener("input", () => validator.validate("input", { resetOnStart: true }))
```

In this example:

- **Fixture:** The email input is registered as a fixture.
- **Plugin:** A plugin is added to validate the email format and make an async server request to check if the email is available.
- **Event binding:** The validation is triggered on input events, allowing real-time validation feedback.

## Debouncing Example: Delaying Server Requests

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

  // Exit early if the signal was aborted during the delay
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

emailInput.addEventListener("input", () => validator.validate("input", { resetOnStart: true }))
```

What changed in this example:

- **Delay:** A debounce delay of 500ms is introduced before the server request to give the user time to stop typing.
- **Early exit:** If the user inputs during the delay, the signal is aborted, allowing the plugin to exit early and skip the server request.

## Conclusion

`pova` offers a flexible, framework-agnostic approach to input validation, allowing you to implement custom workflows that fit the needs of your application. Whether you need simple field validation, complex multi-field checks, or debounced server requests, `pova` gives you complete control over how you want your validation to be like.

Ready to get started? Check out the [**Quick Start**](#quick-start) section above to see how to integrate `pova` into your project. If you have any questions or need further assistance, feel free to open an issue on the [issues page](https://github.com/davidxhk/pova/issues).

I look forward to seeing how you use `pova` to power your form validation!

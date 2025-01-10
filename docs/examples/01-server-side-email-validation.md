## Example

### Server-side email validation

This example shows how to validate an email address on the server in real time, while minimizing unnecessary requests.

To achieve this, we apply a **debouncing** technique using the default `wait` plugin, which pauses the validation process briefly before proceeding.

```typescript
import { defineRegistry, FixtureStore, Validator } from "pova"
import * as defaultPlugins from "pova-plugins"

const emailInput = document.createElement("input")

const emailMessage = document.createElement("span")

function checkEmailAvailability(email: string): Promise<boolean> {
  return fetch(`/check-email-availability?email=${email}`)
    .then(response => response.json())
    .then(result => result.isAvailable)
}

// 1. Define plugin registry
const pluginRegistry = defineRegistry({ ...defaultPlugins })

// 2. Create fixture store
const fixtureStore = new FixtureStore()

// 3. Add fixture with name
fixtureStore.addFixture(emailInput, "email")

// 4. Create validator with default factory plugin props
const emailValidator = new Validator(fixtureStore, { fixture: "email", result: "invalid" })

// 5. Add plugins
emailValidator.addPlugins([
  // Check if email is provided
  { type: "required", message: "Please enter your email address." },

  // Check if provided email is valid
  { type: "email", message: "Please enter a valid email address." },

  // When triggered by "input", wait for 400ms before running the next plugin
  { type: "wait", ms: 400, trigger: "input" },

  // Check if provided email is available
  { type: "invoke", action: checkEmailAvailability, message: "That email is not available." },

  // Fallback validation result
  { result: "valid" },
], pluginRegistry)

// 6. Setup validation triggers
emailInput.addEventListener("input", () => {
  emailValidator.reset()
  emailValidator.validate("input")
})

// 7. Handle validation events
emailValidator.addEventListener("validation", (event) => {
  const { state, message } = event.detail ?? {}
  emailMessage.innerHTML = message || ""
  switch (state) {
    case "invalid":
      emailInput.style.borderColor = "red"
      break
    case "valid":
      emailInput.style.borderColor = "green"
      break
    default:
      emailInput.style.borderColor = "initial"
      break
  }
})
```

### How does it work?

In this example, each time the user types an email address, multiple input events fire, triggering multiple validations. The `wait` plugin is also set to trigger on input, so each validation immediately starts running the `wait` plugin.

Whenever a new validation starts, any previous validation that is still running is **aborted**—which means all its remaining plugins will be skipped. This includes validations still in the middle of the `wait` plugin’s 400ms delay. As a result, these aborted validations will never run the subsequent `invoke` plugin that makes the server request.

Only when the user stops typing for at least 400ms can the last validation’s `wait` plugin complete. At that point, the `invoke` plugin is finally executed, sending the server request. This ensures the request is only sent once the user finishes typing, effectively providing a debouncing effect.

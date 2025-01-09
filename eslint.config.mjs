// @ts-check
import antfu from "@antfu/eslint-config"
import globals from "globals"

export default antfu({
  type: "lib",
  typescript: true,
  languageOptions: {
    globals: globals.browser,
  },
  stylistic: {
    indent: 2,
    quotes: "double",
  },
  rules: {
    "ts/method-signature-style": "off",
    "ts/no-empty-object-type": "off",
    "ts/no-unsafe-declaration-merging": "off",
    "valid-typeof": "off",
  },
})

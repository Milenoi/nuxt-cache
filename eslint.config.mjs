// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

// Flat config; Nuxt generates the base rules, we only override.
export default withNuxt({
  rules: {
    "vue/html-self-closing": "off",
  },
});

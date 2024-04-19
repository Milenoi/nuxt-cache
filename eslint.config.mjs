// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  files: ["**/*.ts", "**/*.tsx"],
  rules: {
    "vue/html-self-closing": "off",
  },
});
// Include your custom configurations directly in the flat config array
// Your custom flat configs go here
// For example:
// {
//   files: ['**/*.ts', '**/*.tsx'],
//   rules: {
//     'no-console': 'off' // allow console.log in TypeScript files
//   }
// }

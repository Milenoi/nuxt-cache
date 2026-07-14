import { defineConfig } from "vitest/config";

// Lightweight unit-test setup for pure utilities. No Nuxt runtime needed here:
// the tested functions import only types (erased at runtime), so plain Vitest
// suffices. Reach for @nuxt/test-utils only once a test needs Nuxt context.
export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
  },
});

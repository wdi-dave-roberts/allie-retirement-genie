/// <reference types="vitest/config" />
import { configDefaults, defineConfig } from "vitest/config";

// Project-pages URL: https://<user>.github.io/allie-retirement-genie/
export default defineConfig({
  base: "/allie-retirement-genie/",
  test: {
    // e2e/ is Playwright's turf (pnpm test:e2e), not vitest's.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});

import { defineConfig } from "@playwright/test";

// Full-journey regression spec runs against the production build at Allie's
// viewport (iPhone-class, 390px) — the same conditions the live app ships in.
export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "pnpm build && pnpm preview --port 4173",
    url: "http://localhost:4173/allie-retirement-genie/",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:4173/allie-retirement-genie/",
    browserName: "chromium",
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  },
});

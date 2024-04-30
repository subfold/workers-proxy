import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./integration-tests",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:8787",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "wrangler dev ./examples/basic/index.ts",
    url: "http://127.0.0.1:8787",
    reuseExistingServer: !process.env.CI,
  },
});

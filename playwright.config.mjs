import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30000,
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true
  },
  webServer: {
    command: "node tools/static-server.mjs",
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: false,
    timeout: 30000
  }
});

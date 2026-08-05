import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT || 3000);
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${port}`;

/**
 * Browser E2E tests (Playwright).
 * Requires Postgres reachable via DATABASE_URL (e.g. `docker compose up db -d`)
 * for admin login flows. Public pages work without DB.
 * Locally reuses an already-running `npm run dev` when present.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: process.env.CI ? "npm run start" : "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        env: {
          ...process.env,
          PORT: String(port),
          DATABASE_URL:
            process.env.DATABASE_URL ||
            "postgresql://cake:cake@localhost:5432/cake?schema=public",
          ADMIN_USERNAME: process.env.ADMIN_USERNAME || "admin",
          ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "change-me",
          SESSION_SECRET:
            process.env.SESSION_SECRET || "e2e-test-session-secret-at-least-32-chars",
          AUTH_COOKIE_SECURE: "false",
          NEXT_TELEMETRY_DISABLED: "1",
        },
      },
});

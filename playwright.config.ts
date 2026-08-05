import fs from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

/** Load `.env` into process.env without overriding values already set. */
function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator <= 0) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

const port = Number(process.env.PLAYWRIGHT_PORT || 3000);
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${port}`;

/**
 * Browser E2E tests (Playwright).
 * Requires Postgres + seeded evidence for questionnaire results.
 * Admin login uses ADMIN_* from `.env` (defaults match `.env.example`).
 */
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // Serialise browser workers to avoid admin bootstrap races on shared DB.
  workers: 1,
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

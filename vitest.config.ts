import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["prisma/**/*.test.ts", "src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./coverage",
      // Focus coverage on backend/API/shared logic exercised by Vitest.
      // UI pages and React components are covered by Playwright E2E instead.
      include: [
        "src/server/**/*.ts",
        "src/app/api/**/*.ts",
        "src/lib/**/*.ts",
        "prisma/**/*.ts",
      ],
      exclude: [
        "**/*.test.ts",
        "**/node_modules/**",
        "prisma/seed.ts",
        "prisma/migrations/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

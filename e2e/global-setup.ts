import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

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

/**
 * Reset the singleton admin row so login E2E uses the current ADMIN_* env
 * (avoids stale password hashes from earlier local boots).
 */
async function resetAdminAccount() {
  const databaseUrl =
    process.env.DATABASE_URL ||
    "postgresql://cake:cake@localhost:5432/cake?schema=public";

  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });

  try {
    await prisma.adminAccount.deleteMany();
  } finally {
    await prisma.$disconnect();
  }
}

export default async function globalSetup() {
  loadDotEnv();
  process.env.ADMIN_USERNAME ||= "admin";
  process.env.ADMIN_PASSWORD ||= "change-me";
  process.env.SESSION_SECRET ||= "e2e-test-session-secret-at-least-32-chars";
  process.env.AUTH_COOKIE_SECURE ||= "false";

  await resetAdminAccount();
}

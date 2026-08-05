import { execSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { EXPECTED_SEED_RECORD_COUNT } from "../../../prisma/seed-data.validation";

/**
 * Prefer an isolated test DB so local `docker compose` data on `cake` is not wiped
 * or polluted by soft-delete assertions. Override with TEST_DATABASE_URL when needed.
 */
const testDbUrl =
  process.env.TEST_DATABASE_URL ??
  "postgresql://cake:cake@localhost:5432/cake_test?schema=public";

async function ensureTestDatabase(url: string) {
  const match = url.match(/^(postgresql:\/\/[^/]+)\/([^?]+)/);
  if (!match) {
    return;
  }

  const [, base, database] = match;
  if (database === "cake") {
    return;
  }

  const admin = new PrismaClient({
    datasources: { db: { url: `${base}/cake` } },
  });

  try {
    const rows = await admin.$queryRawUnsafe<{ exists: boolean }[]>(
      `SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS exists`,
      database,
    );
    if (!rows[0]?.exists) {
      await admin.$executeRawUnsafe(`CREATE DATABASE "${database}"`);
    }
  } finally {
    await admin.$disconnect();
  }
}

describe("evidence repository and seed migration (CAKE-2)", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    process.env.DATABASE_URL = testDbUrl;

    await ensureTestDatabase(testDbUrl);

    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      stdio: "ignore",
      env: { ...process.env, DATABASE_URL: testDbUrl },
    });

    prisma = new PrismaClient({
      datasources: { db: { url: testDbUrl } },
    });

    // Seed skips when rows already exist; clear so soft-deletes from prior runs
    // cannot leave active count = EXPECTED - 2.
    await prisma.evidenceRecord.deleteMany();

    execSync("npx prisma db seed", {
      stdio: "ignore",
      env: { ...process.env, DATABASE_URL: testDbUrl },
    });
  }, 120_000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("seeds the expected record count", async () => {
    const count = await prisma.evidenceRecord.count();
    expect(count).toBe(EXPECTED_SEED_RECORD_COUNT);
  });

  it("excludes soft-deleted records from active queries", async () => {
    const activeBefore = await prisma.evidenceRecord.count({
      where: { deletedAt: null },
    });
    expect(activeBefore).toBe(EXPECTED_SEED_RECORD_COUNT);

    const first = await prisma.evidenceRecord.findFirst({ where: { deletedAt: null } });
    expect(first).not.toBeNull();

    await prisma.evidenceRecord.update({
      where: { id: first!.id },
      data: { deletedAt: new Date() },
    });

    const activeCount = await prisma.evidenceRecord.count({ where: { deletedAt: null } });
    expect(activeCount).toBe(activeBefore - 1);
  });

  it("stores audit timestamps on seeded records", async () => {
    const record = await prisma.evidenceRecord.findFirst({ where: { deletedAt: null } });
    expect(record?.createdAt).toBeInstanceOf(Date);
    expect(record?.updatedAt).toBeInstanceOf(Date);
  });
});

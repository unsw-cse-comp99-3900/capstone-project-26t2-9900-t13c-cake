import { execSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { EXPECTED_SEED_RECORD_COUNT } from "../../../prisma/seed-data.validation";

const testDbUrl =
  process.env.TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "postgresql://cake:cake@localhost:5432/cake_test?schema=public";

describe("evidence repository and seed migration (CAKE-2)", () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    process.env.DATABASE_URL = testDbUrl;

    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      stdio: "ignore",
      env: { ...process.env, DATABASE_URL: testDbUrl },
    });

    execSync("npx prisma db seed", {
      stdio: "ignore",
      env: { ...process.env, DATABASE_URL: testDbUrl },
    });

    prisma = new PrismaClient({
      datasources: { db: { url: testDbUrl } },
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
    const first = await prisma.evidenceRecord.findFirst({ where: { deletedAt: null } });
    expect(first).not.toBeNull();

    await prisma.evidenceRecord.update({
      where: { id: first!.id },
      data: { deletedAt: new Date() },
    });

    const activeCount = await prisma.evidenceRecord.count({ where: { deletedAt: null } });
    expect(activeCount).toBe(EXPECTED_SEED_RECORD_COUNT - 1);
  });

  it("stores audit timestamps on seeded records", async () => {
    const record = await prisma.evidenceRecord.findFirst({ where: { deletedAt: null } });
    expect(record?.createdAt).toBeInstanceOf(Date);
    expect(record?.updatedAt).toBeInstanceOf(Date);
  });
});

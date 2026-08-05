process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://cake:cake@localhost:5432/cake_test?schema=public";

import { execSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { EXPECTED_SEED_RECORD_COUNT } from "../../../prisma/seed-data.validation";
import {
  EvidenceImportConflictError,
  evidenceRepository,
} from "@/server/repositories/evidenceRepository";

const testDbUrl = process.env.DATABASE_URL;

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

const samplePayload = {
  publisher: "Test Publisher",
  title: "Test Guidance",
  year: 2026,
  link: "https://example.org/test",
  jurisdictions: "National",
  context: "Research",
  subCategory: null,
  engagementLevel: "2",
  minHourlyRate: 10,
  maxHourlyRate: 20,
  reimbursementGuidance: true,
  unpaidEngagementGuidance: false,
  exampleOrganisations: null,
};

describe("evidence repository and seed migration (CAKE-2)", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    await ensureTestDatabase(testDbUrl);

    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      stdio: "ignore",
      env: { ...process.env, DATABASE_URL: testDbUrl },
    });

    prisma = new PrismaClient({
      datasources: { db: { url: testDbUrl } },
    });

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
    const activeBefore = await evidenceRepository.findAllActive();
    const first = activeBefore[0];
    expect(first).toBeDefined();

    await evidenceRepository.softDelete(first!.id);

    const activeAfter = await evidenceRepository.findAllActive();
    expect(activeAfter).toHaveLength(activeBefore.length - 1);
    expect(activeAfter.find((record) => record.id === first!.id)).toBeUndefined();
  });

  it("stores audit timestamps on seeded records", async () => {
    const record = await prisma.evidenceRecord.findFirst({ where: { deletedAt: null } });
    expect(record?.createdAt).toBeInstanceOf(Date);
    expect(record?.updatedAt).toBeInstanceOf(Date);
  });

  it("creates, updates, finds, and bulk upserts evidence rows", async () => {
    const created = await evidenceRepository.create(samplePayload);
    expect(created.id).toBeTruthy();
    expect(created.title).toBe("Test Guidance");

    const updated = await evidenceRepository.update(created.id, {
      ...samplePayload,
      title: "Updated Guidance",
      minHourlyRate: 15,
    });
    expect(updated.title).toBe("Updated Guidance");
    expect(updated.minHourlyRate).toBe(15);

    await expect(evidenceRepository.findById(created.id)).resolves.toMatchObject({
      id: created.id,
      title: "Updated Guidance",
    });

    const bulk = await evidenceRepository.bulkUpsert([
      {
        id: "",
        ...samplePayload,
        title: "Bulk Create",
      },
      {
        id: created.id,
        ...samplePayload,
        title: "Bulk Update",
      },
    ]);

    expect(bulk).toEqual({ createdCount: 1, updatedCount: 1 });
    await expect(evidenceRepository.findById(created.id)).resolves.toMatchObject({
      title: "Bulk Update",
    });
  });

  it("rejects bulk updates for unknown active ids", async () => {
    await expect(
      evidenceRepository.bulkUpsert([
        {
          id: "missing-active-id",
          ...samplePayload,
        },
      ]),
    ).rejects.toBeInstanceOf(EvidenceImportConflictError);
  });
});

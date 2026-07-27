import { PrismaClient } from "@prisma/client";
import seedData from "./seed-data.json";
import { validateSeedData } from "./seed-data.validation";

const prisma = new PrismaClient();

const LEGACY_ENGAGEMENT_LEVELS = {
  Inform: "1",
  Consult: "2",
  Involve: "3",
  Collaborate: "4",
  Empower: "5",
  "Extended roles": "6",
} as const;

async function migrateLegacyEngagementLevels() {
  let migrated = 0;

  for (const [legacyLevel, numericLevel] of Object.entries(
    LEGACY_ENGAGEMENT_LEVELS,
  )) {
    const result = await prisma.evidenceRecord.updateMany({
      where: { engagementLevel: legacyLevel },
      data: { engagementLevel: numericLevel },
    });
    migrated += result.count;
  }

  if (migrated > 0) {
    console.log(`Migrated ${migrated} legacy engagement levels to numeric values.`);
  }
}

/** SeedMigrationRunner — import supervisor Excel via seed-data.json (CAKE-2) */
async function main() {
  const rows = validateSeedData(seedData);
  await migrateLegacyEngagementLevels();

  const existing = await prisma.evidenceRecord.count();

  if (existing > 0) {
    console.log(`Seed skipped: ${existing} records already exist.`);
    return;
  }

  await prisma.evidenceRecord.createMany({
    data: rows.map((row) => ({
      publisher: row.publisher,
      title: row.title,
      year: row.year,
      link: row.link,
      jurisdictions: row.jurisdictions,
      context: row.context,
      subCategory: row.subCategory,
      engagementLevel: row.engagementLevel,
      minHourlyRate: row.minHourlyRate,
      maxHourlyRate: row.maxHourlyRate,
      reimbursementGuidance: row.reimbursementGuidance,
      unpaidEngagementGuidance: row.unpaidEngagementGuidance,
      exampleOrganisations: row.exampleOrganisations,
    })),
  });

  const count = await prisma.evidenceRecord.count();
  console.log(`Seeded ${count} evidence records from prisma/seed-data.json`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

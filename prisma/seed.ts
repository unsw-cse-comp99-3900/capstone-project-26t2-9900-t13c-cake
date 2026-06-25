import { PrismaClient } from "@prisma/client";
import seedData from "./seed-data.json";
import { validateSeedData } from "./seed-data.validation";

const prisma = new PrismaClient();

/** SeedMigrationRunner — import supervisor Excel via seed-data.json (CAKE-2) */
async function main() {
  const rows = validateSeedData(seedData);
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

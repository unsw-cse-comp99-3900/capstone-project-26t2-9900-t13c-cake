import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** SeedMigrationRunner — import supervisor Excel via seed-data.json (CAKE-2) */
async function main() {
  const count = await prisma.evidenceRecord.count();
  if (count > 0) {
    console.log(`Seed skipped: ${count} records already exist.`);
    return;
  }

  console.log("No seed data loaded. Add rows to prisma/seed-data.json when the Excel file is available.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

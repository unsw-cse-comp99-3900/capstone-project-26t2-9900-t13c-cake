-- CreateTable
CREATE TABLE "evidence_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "publisher" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "link" TEXT,
    "jurisdictions" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "subCategory" TEXT,
    "engagementLevel" TEXT NOT NULL,
    "minHourlyRate" REAL,
    "maxHourlyRate" REAL,
    "reimbursementGuidance" BOOLEAN NOT NULL DEFAULT false,
    "unpaidEngagementGuidance" BOOLEAN NOT NULL DEFAULT false,
    "exampleOrganisations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateIndex
CREATE INDEX "evidence_records_deletedAt_idx" ON "evidence_records"("deletedAt");

-- CreateIndex
CREATE INDEX "evidence_records_context_engagementLevel_idx" ON "evidence_records"("context", "engagementLevel");

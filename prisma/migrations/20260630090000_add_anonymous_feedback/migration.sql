-- CreateTable
CREATE TABLE "anonymous_feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "partOfTool" TEXT,
    "workedWell" TEXT,
    "improvement" TEXT,
    "consentConfirmed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "anonymous_feedback_createdAt_idx" ON "anonymous_feedback"("createdAt");

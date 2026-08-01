-- Baseline PostgreSQL schema for production / Docker handover.
CREATE TABLE "evidence_records" (
    "id" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "link" TEXT,
    "jurisdictions" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "subCategory" TEXT,
    "engagementLevel" TEXT NOT NULL,
    "minHourlyRate" DOUBLE PRECISION,
    "maxHourlyRate" DOUBLE PRECISION,
    "reimbursementGuidance" BOOLEAN NOT NULL DEFAULT false,
    "unpaidEngagementGuidance" BOOLEAN NOT NULL DEFAULT false,
    "exampleOrganisations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "evidence_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "evidence_records_deletedAt_idx" ON "evidence_records"("deletedAt");
CREATE INDEX "evidence_records_context_engagementLevel_idx" ON "evidence_records"("context", "engagementLevel");

CREATE TABLE "anonymous_feedback" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "partOfTool" TEXT,
    "workedWell" TEXT,
    "improvement" TEXT,
    "consentConfirmed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anonymous_feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "anonymous_feedback_createdAt_idx" ON "anonymous_feedback"("createdAt");

CREATE TABLE "admin_account" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "recoveryEmail" TEXT,
    "recoveryCodeHash" TEXT,
    "recoveryCodeExpiresAt" TIMESTAMP(3),
    "recoveryCodeSentAt" TIMESTAMP(3),
    "recoveryCodeAttempts" INTEGER NOT NULL DEFAULT 0,
    "pendingRecoveryEmail" TEXT,
    "recoveryEmailVerificationCodeHash" TEXT,
    "recoveryEmailVerificationCodeExpiresAt" TIMESTAMP(3),
    "recoveryEmailVerificationCodeSentAt" TIMESTAMP(3),
    "recoveryEmailVerificationCodeAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_account_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_account_username_key" ON "admin_account"("username");

CREATE TABLE "website_usage_events" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "website_usage_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "website_usage_events_eventType_createdAt_idx"
ON "website_usage_events"("eventType", "createdAt");

CREATE INDEX "website_usage_events_path_createdAt_idx"
ON "website_usage_events"("path", "createdAt");

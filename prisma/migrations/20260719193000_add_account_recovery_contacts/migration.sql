ALTER TABLE "admin_account" ADD COLUMN "recoveryEmail" TEXT;
ALTER TABLE "admin_account" ADD COLUMN "recoveryCodeHash" TEXT;
ALTER TABLE "admin_account" ADD COLUMN "recoveryCodeExpiresAt" DATETIME;
ALTER TABLE "admin_account" ADD COLUMN "recoveryCodeSentAt" DATETIME;
ALTER TABLE "admin_account" ADD COLUMN "recoveryCodeAttempts" INTEGER NOT NULL DEFAULT 0;

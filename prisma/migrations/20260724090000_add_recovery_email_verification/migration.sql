ALTER TABLE "admin_account" ADD COLUMN "pendingRecoveryEmail" TEXT;
ALTER TABLE "admin_account" ADD COLUMN "recoveryEmailVerificationCodeHash" TEXT;
ALTER TABLE "admin_account" ADD COLUMN "recoveryEmailVerificationCodeExpiresAt" DATETIME;
ALTER TABLE "admin_account" ADD COLUMN "recoveryEmailVerificationCodeSentAt" DATETIME;
ALTER TABLE "admin_account" ADD COLUMN "recoveryEmailVerificationCodeAttempts" INTEGER NOT NULL DEFAULT 0;

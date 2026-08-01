ALTER TABLE "admin_account" ADD COLUMN "backupRecoveryCodeHash" TEXT;
ALTER TABLE "admin_account" ADD COLUMN "backupRecoveryCodeCreatedAt" DATETIME;
ALTER TABLE "admin_account" ADD COLUMN "backupRecoveryCodeConfirmedAt" DATETIME;

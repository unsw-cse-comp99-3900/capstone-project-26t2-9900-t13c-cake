-- AlterTable
ALTER TABLE "admin_account" ADD COLUMN "backupRecoveryCodeHash" TEXT;
ALTER TABLE "admin_account" ADD COLUMN "backupRecoveryCodeCreatedAt" TIMESTAMP(3);
ALTER TABLE "admin_account" ADD COLUMN "backupRecoveryCodeConfirmedAt" TIMESTAMP(3);

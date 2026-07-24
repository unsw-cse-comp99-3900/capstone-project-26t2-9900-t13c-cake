-- CreateTable
CREATE TABLE "admin_account" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_account_username_key" ON "admin_account"("username");

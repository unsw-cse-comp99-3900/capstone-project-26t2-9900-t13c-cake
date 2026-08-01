import { prisma } from "@/server/db/prisma";
import { verifyBackupRecoveryCode } from "@/server/utils/backupRecoveryCodeUtils";
import { hashPassword, verifyPassword } from "@/server/utils/passwordUtils";

const SINGLETON_ID = "default";

export type AdminAccountRecord = {
  id: string;
  username: string;
  passwordHash: string;
  recoveryEmail: string | null;
  recoveryCodeHash: string | null;
  recoveryCodeExpiresAt: Date | null;
  recoveryCodeSentAt: Date | null;
  recoveryCodeAttempts: number;
  pendingRecoveryEmail: string | null;
  recoveryEmailVerificationCodeHash: string | null;
  recoveryEmailVerificationCodeExpiresAt: Date | null;
  recoveryEmailVerificationCodeSentAt: Date | null;
  recoveryEmailVerificationCodeAttempts: number;
  backupRecoveryCodeHash: string | null;
  backupRecoveryCodeCreatedAt: Date | null;
  backupRecoveryCodeConfirmedAt: Date | null;
};

export type RecoveryContacts = {
  email: string | null;
};

export type ChangeUsernameResult =
  | { ok: true; username: string }
  | { ok: false; error: "INVALID_PASSWORD" | "INVALID_USERNAME" | "USERNAME_UNCHANGED" | "NOT_CONFIGURED" };

export type ChangePasswordResult =
  | { ok: true }
  | {
      ok: false;
      error: "INVALID_PASSWORD" | "INVALID_NEW_PASSWORD" | "PASSWORD_UNCHANGED" | "NOT_CONFIGURED";
    };

export type ResetPasswordResult =
  | { ok: true; username: string }
  | { ok: false; error: "INVALID_USERNAME" | "INVALID_NEW_PASSWORD" | "NOT_CONFIGURED" };

export type PrepareRecoveryEmailChangeResult =
  | { ok: true; email: string; codeSentAt: Date | null }
  | {
      ok: false;
      error:
        | "INVALID_PASSWORD"
        | "INVALID_EMAIL"
        | "EMAIL_UNCHANGED"
        | "NOT_CONFIGURED";
    };

export type VerifyRecoveryEmailChangeResult =
  | { ok: true; email: string }
  | {
      ok: false;
      error:
        | "INVALID_RECOVERY_CODE"
        | "RECOVERY_CODE_EXPIRED"
        | "TOO_MANY_ATTEMPTS"
        | "NOT_CONFIGURED";
    };

export type ResetPasswordWithCodeResult =
  | { ok: true; username: string }
  | {
      ok: false;
      error:
        | "INVALID_USERNAME"
        | "INVALID_NEW_PASSWORD"
        | "INVALID_RECOVERY_CODE"
        | "RECOVERY_CODE_EXPIRED"
        | "TOO_MANY_ATTEMPTS"
        | "NOT_CONFIGURED";
    };

export type VerifyRecoveryCodeResult =
  | { ok: true }
  | {
      ok: false;
      error: "INVALID_RECOVERY_CODE" | "RECOVERY_CODE_EXPIRED" | "TOO_MANY_ATTEMPTS" | "NOT_CONFIGURED";
    };

export type BackupRecoveryStatus = {
  setupRequired: boolean;
  createdAt: Date | null;
  confirmedAt: Date | null;
};

export type ConfirmBackupRecoveryCodeResult =
  | { ok: true }
  | { ok: false; error: "RECOVERY_CODE_UNAVAILABLE" };

export type ResetPasswordWithBackupRecoveryCodeResult =
  | { ok: true; username: string }
  | {
      ok: false;
      error:
        | "INVALID_USERNAME"
        | "INVALID_NEW_PASSWORD"
        | "INVALID_RECOVERY_CODE"
        | "NOT_CONFIGURED";
    };

function readBootstrapConfig(): { username: string; password: string } | null {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!username || password === undefined || password === "") {
    return null;
  }

  return { username, password };
}

export function isValidAdminUsername(username: string): boolean {
  const trimmed = username.trim();
  return /^[\w.-]{3,32}$/.test(trimmed);
}

export function isValidAdminPassword(password: string): boolean {
  return password.length >= 8 && password.length <= 128;
}

export function isValidRecoveryEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/** Layer 2 — AdminAccountRepository (CAKE-10) */
export const adminAccountRepository = {
  async getOrCreate(): Promise<AdminAccountRecord | null> {
    const existing = await prisma.adminAccount.findUnique({
      where: { id: SINGLETON_ID },
    });

    if (existing) {
      return existing;
    }

    const bootstrap = readBootstrapConfig();
    if (!bootstrap) {
      return null;
    }

    return prisma.adminAccount.create({
      data: {
        id: SINGLETON_ID,
        username: bootstrap.username,
        passwordHash: hashPassword(bootstrap.password),
      },
    });
  },

  async verifyCredentials(username: string, password: string): Promise<boolean> {
    const account = await this.getOrCreate();
    if (!account) {
      return false;
    }

    const normalizedUsername = username.trim();
    if (!normalizedUsername) {
      return false;
    }

    return (
      account.username === normalizedUsername &&
      verifyPassword(password, account.passwordHash)
    );
  },

  async getBackupRecoveryStatus(): Promise<BackupRecoveryStatus | null> {
    const account = await this.getOrCreate();
    if (!account) {
      return null;
    }

    return {
      setupRequired: !(
        account.backupRecoveryCodeHash &&
        account.backupRecoveryCodeConfirmedAt
      ),
      createdAt: account.backupRecoveryCodeCreatedAt ?? null,
      confirmedAt: account.backupRecoveryCodeConfirmedAt ?? null,
    };
  },

  async saveBackupRecoveryCode(codeHash: string, createdAt = new Date()): Promise<void> {
    await this.getOrCreate();
    await prisma.adminAccount.update({
      where: { id: SINGLETON_ID },
      data: {
        backupRecoveryCodeHash: codeHash,
        backupRecoveryCodeCreatedAt: createdAt,
        backupRecoveryCodeConfirmedAt: null,
      },
    });
  },

  async confirmBackupRecoveryCode(
    createdAt: Date,
    confirmedAt = new Date(),
  ): Promise<ConfirmBackupRecoveryCodeResult> {
    const result = await prisma.adminAccount.updateMany({
      where: {
        id: SINGLETON_ID,
        backupRecoveryCodeHash: { not: null },
        backupRecoveryCodeCreatedAt: createdAt,
      },
      data: {
        backupRecoveryCodeConfirmedAt: confirmedAt,
      },
    });

    return result.count === 1
      ? { ok: true }
      : { ok: false, error: "RECOVERY_CODE_UNAVAILABLE" };
  },

  async resetPasswordWithBackupRecoveryCode(
    recoveryCode: string,
    newUsername: string,
    newPassword: string,
  ): Promise<ResetPasswordWithBackupRecoveryCodeResult> {
    const account = await this.getOrCreate();
    if (!account) {
      return { ok: false, error: "NOT_CONFIGURED" };
    }

    const trimmedUsername = newUsername.trim();
    if (!isValidAdminUsername(trimmedUsername)) {
      return { ok: false, error: "INVALID_USERNAME" };
    }

    if (!isValidAdminPassword(newPassword)) {
      return { ok: false, error: "INVALID_NEW_PASSWORD" };
    }

    if (
      !account.backupRecoveryCodeHash ||
      !account.backupRecoveryCodeConfirmedAt ||
      !verifyBackupRecoveryCode(recoveryCode, account.backupRecoveryCodeHash)
    ) {
      return { ok: false, error: "INVALID_RECOVERY_CODE" };
    }

    const updated = await prisma.adminAccount.updateMany({
      where: {
        id: SINGLETON_ID,
        backupRecoveryCodeHash: account.backupRecoveryCodeHash,
        backupRecoveryCodeConfirmedAt: { not: null },
      },
      data: {
        username: trimmedUsername,
        passwordHash: hashPassword(newPassword),
        backupRecoveryCodeHash: null,
        backupRecoveryCodeCreatedAt: null,
        backupRecoveryCodeConfirmedAt: null,
        recoveryCodeHash: null,
        recoveryCodeExpiresAt: null,
        recoveryCodeSentAt: null,
        recoveryCodeAttempts: 0,
      },
    });

    return updated.count === 1
      ? { ok: true, username: trimmedUsername }
      : { ok: false, error: "INVALID_RECOVERY_CODE" };
  },

  async changeUsername(
    currentPassword: string,
    newUsername: string,
  ): Promise<ChangeUsernameResult> {
    const account = await this.getOrCreate();
    if (!account) {
      return { ok: false, error: "NOT_CONFIGURED" };
    }

    if (!verifyPassword(currentPassword, account.passwordHash)) {
      return { ok: false, error: "INVALID_PASSWORD" };
    }

    const trimmedUsername = newUsername.trim();
    if (!isValidAdminUsername(trimmedUsername)) {
      return { ok: false, error: "INVALID_USERNAME" };
    }

    if (trimmedUsername === account.username) {
      return { ok: false, error: "USERNAME_UNCHANGED" };
    }

    const updated = await prisma.adminAccount.update({
      where: { id: SINGLETON_ID },
      data: { username: trimmedUsername },
    });

    return { ok: true, username: updated.username };
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<ChangePasswordResult> {
    const account = await this.getOrCreate();
    if (!account) {
      return { ok: false, error: "NOT_CONFIGURED" };
    }

    if (!verifyPassword(currentPassword, account.passwordHash)) {
      return { ok: false, error: "INVALID_PASSWORD" };
    }

    if (!isValidAdminPassword(newPassword)) {
      return { ok: false, error: "INVALID_NEW_PASSWORD" };
    }

    if (verifyPassword(newPassword, account.passwordHash)) {
      return { ok: false, error: "PASSWORD_UNCHANGED" };
    }

    await prisma.adminAccount.update({
      where: { id: SINGLETON_ID },
      data: { passwordHash: hashPassword(newPassword) },
    });

    return { ok: true };
  },

  async resetAccount(
    newUsername: string,
    newPassword: string,
  ): Promise<ResetPasswordResult> {
    const account = await this.getOrCreate();
    if (!account) {
      return { ok: false, error: "NOT_CONFIGURED" };
    }

    const trimmedUsername = newUsername.trim();
    if (!isValidAdminUsername(trimmedUsername)) {
      return { ok: false, error: "INVALID_USERNAME" };
    }

    if (!isValidAdminPassword(newPassword)) {
      return { ok: false, error: "INVALID_NEW_PASSWORD" };
    }

    const updated = await prisma.adminAccount.update({
      where: { id: SINGLETON_ID },
      data: {
        username: trimmedUsername,
        passwordHash: hashPassword(newPassword),
      },
    });

    return { ok: true, username: updated.username };
  },

  async getRecoveryContacts(): Promise<RecoveryContacts | null> {
    const account = await this.getOrCreate();
    if (!account) {
      return null;
    }

    return {
      email: account.recoveryEmail,
    };
  },

  async getRecoveryRequestState(): Promise<{
    contacts: RecoveryContacts;
    codeSentAt: Date | null;
  } | null> {
    const account = await this.getOrCreate();
    if (!account) {
      return null;
    }

    return {
      contacts: {
        email: account.recoveryEmail,
      },
      codeSentAt: account.recoveryCodeSentAt,
    };
  },

  async getRecoveryEmailVerificationState(): Promise<{
    contacts: RecoveryContacts;
    pendingEmail: string | null;
    codeSentAt: Date | null;
  } | null> {
    const account = await this.getOrCreate();
    if (!account) {
      return null;
    }

    return {
      contacts: {
        email: account.recoveryEmail,
      },
      pendingEmail: account.pendingRecoveryEmail,
      codeSentAt: account.recoveryEmailVerificationCodeSentAt,
    };
  },

  async prepareRecoveryEmailChange(
    currentPassword: string,
    email: string,
  ): Promise<PrepareRecoveryEmailChangeResult> {
    const account = await this.getOrCreate();
    if (!account) {
      return { ok: false, error: "NOT_CONFIGURED" };
    }

    if (!verifyPassword(currentPassword, account.passwordHash)) {
      return { ok: false, error: "INVALID_PASSWORD" };
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !isValidRecoveryEmail(normalizedEmail)) {
      return { ok: false, error: "INVALID_EMAIL" };
    }

    if (normalizedEmail === account.recoveryEmail) {
      return { ok: false, error: "EMAIL_UNCHANGED" };
    }

    return {
      ok: true,
      email: normalizedEmail,
      codeSentAt: account.recoveryEmailVerificationCodeSentAt,
    };
  },

  async saveRecoveryEmailVerificationCode(
    email: string,
    codeHash: string,
    expiresAt: Date,
    sentAt: Date,
  ): Promise<void> {
    await prisma.adminAccount.update({
      where: { id: SINGLETON_ID },
      data: {
        pendingRecoveryEmail: email,
        recoveryEmailVerificationCodeHash: codeHash,
        recoveryEmailVerificationCodeExpiresAt: expiresAt,
        recoveryEmailVerificationCodeSentAt: sentAt,
        recoveryEmailVerificationCodeAttempts: 0,
      },
    });
  },

  async verifyAndApplyRecoveryEmailChange(
    codeHash: string,
    now = new Date(),
  ): Promise<VerifyRecoveryEmailChangeResult> {
    const account = await this.getOrCreate();
    if (!account) {
      return { ok: false, error: "NOT_CONFIGURED" };
    }

    if (account.recoveryEmailVerificationCodeAttempts >= 5) {
      return { ok: false, error: "TOO_MANY_ATTEMPTS" };
    }

    if (
      !account.pendingRecoveryEmail ||
      !account.recoveryEmailVerificationCodeHash ||
      !account.recoveryEmailVerificationCodeExpiresAt
    ) {
      return { ok: false, error: "INVALID_RECOVERY_CODE" };
    }

    if (account.recoveryEmailVerificationCodeExpiresAt <= now) {
      return { ok: false, error: "RECOVERY_CODE_EXPIRED" };
    }

    if (account.recoveryEmailVerificationCodeHash !== codeHash) {
      await prisma.adminAccount.update({
        where: { id: SINGLETON_ID },
        data: { recoveryEmailVerificationCodeAttempts: { increment: 1 } },
      });
      return { ok: false, error: "INVALID_RECOVERY_CODE" };
    }

    const email = account.pendingRecoveryEmail;
    await prisma.adminAccount.update({
      where: { id: SINGLETON_ID },
      data: {
        recoveryEmail: email,
        pendingRecoveryEmail: null,
        recoveryEmailVerificationCodeHash: null,
        recoveryEmailVerificationCodeExpiresAt: null,
        recoveryEmailVerificationCodeSentAt: null,
        recoveryEmailVerificationCodeAttempts: 0,
        recoveryCodeHash: null,
        recoveryCodeExpiresAt: null,
        recoveryCodeSentAt: null,
        recoveryCodeAttempts: 0,
      },
    });

    return { ok: true, email };
  },

  async saveRecoveryCode(
    codeHash: string,
    expiresAt: Date,
    sentAt: Date,
  ): Promise<void> {
    await prisma.adminAccount.update({
      where: { id: SINGLETON_ID },
      data: {
        recoveryCodeHash: codeHash,
        recoveryCodeExpiresAt: expiresAt,
        recoveryCodeSentAt: sentAt,
        recoveryCodeAttempts: 0,
      },
    });
  },

  async verifyRecoveryCode(
    codeHash: string,
    now = new Date(),
  ): Promise<VerifyRecoveryCodeResult> {
    const account = await this.getOrCreate();
    if (!account) {
      return { ok: false, error: "NOT_CONFIGURED" };
    }

    if (account.recoveryCodeAttempts >= 5) {
      return { ok: false, error: "TOO_MANY_ATTEMPTS" };
    }

    if (!account.recoveryCodeHash || !account.recoveryCodeExpiresAt) {
      return { ok: false, error: "INVALID_RECOVERY_CODE" };
    }

    if (account.recoveryCodeExpiresAt <= now) {
      return { ok: false, error: "RECOVERY_CODE_EXPIRED" };
    }

    if (account.recoveryCodeHash !== codeHash) {
      await prisma.adminAccount.update({
        where: { id: SINGLETON_ID },
        data: { recoveryCodeAttempts: { increment: 1 } },
      });
      return { ok: false, error: "INVALID_RECOVERY_CODE" };
    }

    return { ok: true };
  },

  async resetPasswordWithCode(
    codeHash: string,
    newUsername: string,
    newPassword: string,
    now = new Date(),
  ): Promise<ResetPasswordWithCodeResult> {
    const account = await this.getOrCreate();
    if (!account) {
      return { ok: false, error: "NOT_CONFIGURED" };
    }

    const trimmedUsername = newUsername.trim();
    if (!isValidAdminUsername(trimmedUsername)) {
      return { ok: false, error: "INVALID_USERNAME" };
    }

    if (!isValidAdminPassword(newPassword)) {
      return { ok: false, error: "INVALID_NEW_PASSWORD" };
    }

    if (account.recoveryCodeAttempts >= 5) {
      return { ok: false, error: "TOO_MANY_ATTEMPTS" };
    }

    if (!account.recoveryCodeHash || !account.recoveryCodeExpiresAt) {
      return { ok: false, error: "INVALID_RECOVERY_CODE" };
    }

    if (account.recoveryCodeExpiresAt <= now) {
      return { ok: false, error: "RECOVERY_CODE_EXPIRED" };
    }

    if (account.recoveryCodeHash !== codeHash) {
      await prisma.adminAccount.update({
        where: { id: SINGLETON_ID },
        data: { recoveryCodeAttempts: { increment: 1 } },
      });
      return { ok: false, error: "INVALID_RECOVERY_CODE" };
    }

    await prisma.adminAccount.update({
      where: { id: SINGLETON_ID },
      data: {
        username: trimmedUsername,
        passwordHash: hashPassword(newPassword),
        recoveryCodeHash: null,
        recoveryCodeExpiresAt: null,
        recoveryCodeSentAt: null,
        recoveryCodeAttempts: 0,
      },
    });

    return { ok: true, username: trimmedUsername };
  },
};

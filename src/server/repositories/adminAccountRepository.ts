import { prisma } from "@/server/db/prisma";
import { hashPassword, verifyPassword } from "@/server/utils/passwordUtils";

const SINGLETON_ID = "default";

export type AdminAccountRecord = {
  id: string;
  username: string;
  passwordHash: string;
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
};

import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/server/db/prisma";
import {
  adminAccountRepository,
  isValidAdminPassword,
  isValidAdminUsername,
  isValidRecoveryEmail,
} from "@/server/repositories/adminAccountRepository";

describe("adminAccountRepository (CAKE-10)", () => {
  beforeEach(async () => {
    vi.stubEnv("ADMIN_USERNAME", "admin");
    vi.stubEnv("ADMIN_PASSWORD", "secret-pass");
    await prisma.adminAccount.deleteMany();
  });

  afterAll(async () => {
    await prisma.adminAccount.deleteMany();
    vi.unstubAllEnvs();
  });

  it("bootstraps the singleton account from env on first use", async () => {
    const account = await adminAccountRepository.getOrCreate();

    expect(account?.username).toBe("admin");
    await expect(adminAccountRepository.verifyCredentials("admin", "secret-pass")).resolves.toBe(
      true,
    );
  });

  it("changes the username when the current password is correct", async () => {
    await adminAccountRepository.getOrCreate();

    const result = await adminAccountRepository.changeUsername("secret-pass", "maintainer");

    expect(result).toEqual({ ok: true, username: "maintainer" });
    await expect(
      adminAccountRepository.verifyCredentials("maintainer", "secret-pass"),
    ).resolves.toBe(true);
    await expect(adminAccountRepository.verifyCredentials("admin", "secret-pass")).resolves.toBe(
      false,
    );
  });

  it("rejects invalid usernames", () => {
    expect(isValidAdminUsername("ab")).toBe(false);
    expect(isValidAdminUsername("valid.user-1")).toBe(true);
    expect(isValidAdminUsername("invalid name")).toBe(false);
  });

  it("changes the password when the current password is correct", async () => {
    await adminAccountRepository.getOrCreate();

    const result = await adminAccountRepository.changePassword("secret-pass", "new-secret-pass");

    expect(result).toEqual({ ok: true });
    await expect(
      adminAccountRepository.verifyCredentials("admin", "new-secret-pass"),
    ).resolves.toBe(true);
    await expect(adminAccountRepository.verifyCredentials("admin", "secret-pass")).resolves.toBe(
      false,
    );
  });

  it("rejects invalid passwords", () => {
    expect(isValidAdminPassword("short")).toBe(false);
    expect(isValidAdminPassword("long-enough-password")).toBe(true);
  });

  it("resets the username and password without the current password", async () => {
    await adminAccountRepository.getOrCreate();

    const result = await adminAccountRepository.resetAccount("admin", "brand-new-password");

    expect(result).toEqual({ ok: true, username: "admin" });
    await expect(
      adminAccountRepository.verifyCredentials("admin", "brand-new-password"),
    ).resolves.toBe(true);
  });

  it("validates recovery email addresses", () => {
    expect(isValidRecoveryEmail("admin@example.com")).toBe(true);
    expect(isValidRecoveryEmail("invalid-address")).toBe(false);
  });

  it("requires the current password and a non-empty valid recovery email", async () => {
    await adminAccountRepository.getOrCreate();

    await expect(
      adminAccountRepository.prepareRecoveryEmailChange(
        "wrong-password",
        "admin@example.com",
      ),
    ).resolves.toEqual({ ok: false, error: "INVALID_PASSWORD" });

    await expect(
      adminAccountRepository.prepareRecoveryEmailChange("secret-pass", ""),
    ).resolves.toEqual({ ok: false, error: "INVALID_EMAIL" });

    await expect(
      adminAccountRepository.prepareRecoveryEmailChange(
        "secret-pass",
        "Admin@Example.com",
      ),
    ).resolves.toMatchObject({
      ok: true,
      email: "admin@example.com",
    });
  });

  it("only replaces the recovery email after a valid verification code", async () => {
    await adminAccountRepository.getOrCreate();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
    await adminAccountRepository.saveRecoveryCode("old-password-code", expiresAt, now);
    await adminAccountRepository.saveRecoveryEmailVerificationCode(
      "admin@example.com",
      "correct-email-code",
      expiresAt,
      now,
    );

    await expect(
      adminAccountRepository.verifyAndApplyRecoveryEmailChange("wrong-email-code"),
    ).resolves.toEqual({ ok: false, error: "INVALID_RECOVERY_CODE" });
    await expect(adminAccountRepository.getRecoveryContacts()).resolves.toEqual({
      email: null,
    });

    await expect(
      adminAccountRepository.verifyAndApplyRecoveryEmailChange("correct-email-code"),
    ).resolves.toEqual({ ok: true, email: "admin@example.com" });
    await expect(adminAccountRepository.getRecoveryEmailVerificationState()).resolves.toEqual({
      contacts: { email: "admin@example.com" },
      pendingEmail: null,
      codeSentAt: null,
    });

    const account = await prisma.adminAccount.findUnique({ where: { id: "default" } });
    expect(account?.recoveryCodeHash).toBeNull();
    expect(account?.recoveryCodeExpiresAt).toBeNull();
  });

  it("consumes a valid one-time code once and limits invalid attempts", async () => {
    await adminAccountRepository.getOrCreate();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await adminAccountRepository.saveRecoveryCode("correct-hash", expiresAt, new Date());

    await expect(
      adminAccountRepository.verifyRecoveryCode("wrong-hash"),
    ).resolves.toEqual({ ok: false, error: "INVALID_RECOVERY_CODE" });

    await expect(adminAccountRepository.verifyRecoveryCode("correct-hash")).resolves.toEqual({
      ok: true,
    });

    await expect(
      adminAccountRepository.resetPasswordWithCode("wrong-hash", "new-admin", "new-secret-pass"),
    ).resolves.toEqual({ ok: false, error: "INVALID_RECOVERY_CODE" });

    await expect(
      adminAccountRepository.resetPasswordWithCode("correct-hash", "new-admin", "new-secret-pass"),
    ).resolves.toEqual({ ok: true, username: "new-admin" });
    await expect(
      adminAccountRepository.verifyCredentials("new-admin", "new-secret-pass"),
    ).resolves.toBe(true);
  });
});

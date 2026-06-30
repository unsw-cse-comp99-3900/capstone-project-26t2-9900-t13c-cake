import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/server/db/prisma";
import {
  adminAccountRepository,
  isValidAdminPassword,
  isValidAdminUsername,
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
});

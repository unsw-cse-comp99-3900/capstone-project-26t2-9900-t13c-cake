import { beforeEach, describe, expect, it, vi } from "vitest";
import { accountRecoveryService } from "@/server/services/accountRecoveryService";
import { adminAccountRepository } from "@/server/repositories/adminAccountRepository";
import { recoveryDeliveryService } from "@/server/services/recoveryDeliveryService";

vi.mock("@/server/repositories/adminAccountRepository", () => ({
  adminAccountRepository: {
    getRecoveryContacts: vi.fn(),
    getBackupRecoveryStatus: vi.fn(),
    getRecoveryRequestState: vi.fn(),
    saveRecoveryCode: vi.fn(),
    resetPasswordWithCode: vi.fn(),
    resetPasswordWithBackupRecoveryCode: vi.fn(),
  },
}));

vi.mock("@/server/services/recoveryDeliveryService", () => ({
  recoveryDeliveryService: {
    isConfigured: vi.fn(),
    sendEmail: vi.fn(),
  },
}));

describe("accountRecoveryService", () => {
  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
    vi.mocked(adminAccountRepository.getRecoveryContacts).mockReset();
    vi.mocked(adminAccountRepository.getBackupRecoveryStatus).mockReset();
    vi.mocked(adminAccountRepository.getRecoveryRequestState).mockReset();
    vi.mocked(adminAccountRepository.saveRecoveryCode).mockReset();
    vi.mocked(adminAccountRepository.resetPasswordWithCode).mockReset();
    vi.mocked(
      adminAccountRepository.resetPasswordWithBackupRecoveryCode,
    ).mockReset();
    vi.mocked(recoveryDeliveryService.isConfigured).mockReset();
    vi.mocked(recoveryDeliveryService.sendEmail).mockReset();
  });

  it("returns masked configured recovery options", async () => {
    vi.mocked(adminAccountRepository.getRecoveryContacts).mockResolvedValue({
      email: "admin@example.com",
    });
    vi.mocked(adminAccountRepository.getBackupRecoveryStatus).mockResolvedValue({
      setupRequired: false,
      createdAt: new Date("2026-07-23T10:00:00.000Z"),
      confirmedAt: new Date("2026-07-23T10:01:00.000Z"),
    });
    vi.mocked(recoveryDeliveryService.isConfigured).mockReturnValue(true);

    await expect(accountRecoveryService.getPublicOptions()).resolves.toMatchObject({
      email: { available: true, masked: "ad***@example.com" },
      backupRecoveryCode: true,
    });
  });

  it("delivers and persists a hashed email recovery code", async () => {
    const now = new Date("2026-07-19T09:00:00.000Z");
    vi.mocked(adminAccountRepository.getRecoveryRequestState).mockResolvedValue({
      contacts: { email: "admin@example.com" },
      codeSentAt: null,
    });
    vi.mocked(recoveryDeliveryService.isConfigured).mockReturnValue(true);
    vi.mocked(recoveryDeliveryService.sendEmail).mockResolvedValue();
    vi.mocked(adminAccountRepository.saveRecoveryCode).mockResolvedValue();

    const result = await accountRecoveryService.requestCode(now);

    expect(result).toMatchObject({ ok: true, maskedDestination: "ad***@example.com" });
    expect(recoveryDeliveryService.sendEmail).toHaveBeenCalledWith(
      "admin@example.com",
      expect.stringMatching(/^\d{6}$/),
    );
    expect(adminAccountRepository.saveRecoveryCode).toHaveBeenCalledWith(
      expect.not.stringMatching(/^\d{6}$/),
      new Date("2026-07-19T09:10:00.000Z"),
      now,
    );
  });

  it("rate limits repeated code requests", async () => {
    const now = new Date("2026-07-19T09:00:30.000Z");
    vi.mocked(adminAccountRepository.getRecoveryRequestState).mockResolvedValue({
      contacts: { email: "admin@example.com" },
      codeSentAt: new Date("2026-07-19T09:00:00.000Z"),
    });
    vi.mocked(recoveryDeliveryService.isConfigured).mockReturnValue(true);

    await expect(accountRecoveryService.requestCode(now)).resolves.toEqual({
      ok: false,
      error: "RATE_LIMITED",
      retryAfter: 30,
    });
    expect(recoveryDeliveryService.sendEmail).not.toHaveBeenCalled();
  });

  it("resets the password through the repository for a valid backup code format", async () => {
    vi.mocked(
      adminAccountRepository.resetPasswordWithBackupRecoveryCode,
    ).mockResolvedValue({ ok: true, username: "new-admin" });

    await expect(
      accountRecoveryService.resetPasswordWithBackupCode(
        "abcd efgh jkmn pqrs tvwx",
        "new-admin",
        "new-secret-pass",
      ),
    ).resolves.toEqual({ ok: true, username: "new-admin" });
    expect(
      adminAccountRepository.resetPasswordWithBackupRecoveryCode,
    ).toHaveBeenCalledWith(
      "abcd efgh jkmn pqrs tvwx",
      "new-admin",
      "new-secret-pass",
    );
  });

  it("rejects malformed backup codes before reading the stored hash", async () => {
    await expect(
      accountRecoveryService.resetPasswordWithBackupCode(
        "invalid",
        "new-admin",
        "new-secret-pass",
      ),
    ).resolves.toEqual({ ok: false, error: "INVALID_RECOVERY_CODE" });
    expect(
      adminAccountRepository.resetPasswordWithBackupRecoveryCode,
    ).not.toHaveBeenCalled();
  });
});

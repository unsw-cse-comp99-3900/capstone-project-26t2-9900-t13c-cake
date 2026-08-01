import { beforeEach, describe, expect, it, vi } from "vitest";
import { backupRecoveryService } from "@/server/services/backupRecoveryService";
import { adminAccountRepository } from "@/server/repositories/adminAccountRepository";

vi.mock("@/server/repositories/adminAccountRepository", () => ({
  adminAccountRepository: {
    getBackupRecoveryStatus: vi.fn(),
    saveBackupRecoveryCode: vi.fn(),
    confirmBackupRecoveryCode: vi.fn(),
  },
}));

describe("backupRecoveryService", () => {
  beforeEach(() => {
    vi.mocked(adminAccountRepository.getBackupRecoveryStatus).mockReset();
    vi.mocked(adminAccountRepository.saveBackupRecoveryCode).mockReset();
    vi.mocked(adminAccountRepository.confirmBackupRecoveryCode).mockReset();
  });

  it("returns the current setup requirement", async () => {
    vi.mocked(adminAccountRepository.getBackupRecoveryStatus).mockResolvedValue({
      setupRequired: true,
      createdAt: null,
      confirmedAt: null,
    });

    await expect(backupRecoveryService.getStatus()).resolves.toEqual({
      setupRequired: true,
      createdAt: null,
      confirmedAt: null,
    });
  });

  it("returns a plaintext code once while persisting only its hash", async () => {
    vi.mocked(adminAccountRepository.saveBackupRecoveryCode).mockResolvedValue();
    const now = new Date("2026-07-23T10:00:00.000Z");

    const result = await backupRecoveryService.generate(now);

    expect(result.recoveryCode).toMatch(
      /^[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}(?:-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}){4}$/,
    );
    expect(result.createdAt).toBe(now.toISOString());
    expect(adminAccountRepository.saveBackupRecoveryCode).toHaveBeenCalledWith(
      expect.not.stringContaining(result.recoveryCode),
      now,
    );
  });

  it("rejects an invalid generation timestamp when confirming", async () => {
    await expect(backupRecoveryService.confirm("not-a-date")).resolves.toEqual({
      ok: false,
      error: "RECOVERY_CODE_UNAVAILABLE",
    });
    expect(adminAccountRepository.confirmBackupRecoveryCode).not.toHaveBeenCalled();
  });

  it("confirms the matching generated code", async () => {
    vi.mocked(adminAccountRepository.confirmBackupRecoveryCode).mockResolvedValue({
      ok: true,
    });

    await expect(
      backupRecoveryService.confirm("2026-07-23T10:00:00.000Z"),
    ).resolves.toEqual({ ok: true });
    expect(adminAccountRepository.confirmBackupRecoveryCode).toHaveBeenCalledWith(
      new Date("2026-07-23T10:00:00.000Z"),
    );
  });
});

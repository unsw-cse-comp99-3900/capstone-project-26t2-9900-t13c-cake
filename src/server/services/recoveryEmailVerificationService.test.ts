import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminAccountRepository } from "@/server/repositories/adminAccountRepository";
import { recoveryDeliveryService } from "@/server/services/recoveryDeliveryService";
import { recoveryEmailVerificationService } from "@/server/services/recoveryEmailVerificationService";

vi.mock("@/server/repositories/adminAccountRepository", () => ({
  adminAccountRepository: {
    getRecoveryEmailVerificationState: vi.fn(),
    prepareRecoveryEmailChange: vi.fn(),
    saveRecoveryEmailVerificationCode: vi.fn(),
    verifyAndApplyRecoveryEmailChange: vi.fn(),
  },
}));

vi.mock("@/server/services/recoveryDeliveryService", () => ({
  recoveryDeliveryService: {
    isConfigured: vi.fn(),
    sendEmail: vi.fn(),
  },
}));

describe("recoveryEmailVerificationService", () => {
  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
    vi.mocked(
      adminAccountRepository.getRecoveryEmailVerificationState,
    ).mockReset();
    vi.mocked(adminAccountRepository.prepareRecoveryEmailChange).mockReset();
    vi.mocked(
      adminAccountRepository.saveRecoveryEmailVerificationCode,
    ).mockReset();
    vi.mocked(adminAccountRepository.verifyAndApplyRecoveryEmailChange).mockReset();
    vi.mocked(recoveryDeliveryService.isConfigured).mockReset();
    vi.mocked(recoveryDeliveryService.sendEmail).mockReset();
  });

  it("reports current and pending recovery email state", async () => {
    vi.mocked(
      adminAccountRepository.getRecoveryEmailVerificationState,
    ).mockResolvedValue({
      contacts: { email: "old@example.com" },
      pendingEmail: "new@example.com",
      codeSentAt: new Date(),
    });

    await expect(recoveryEmailVerificationService.getStatus()).resolves.toEqual({
      email: "old@example.com",
      pendingEmail: "new@example.com",
      maskedPendingEmail: "ne**@example.com",
    });
  });

  it("delivers a six-digit code before saving the pending email", async () => {
    const now = new Date("2026-07-24T09:00:00.000Z");
    vi.mocked(adminAccountRepository.prepareRecoveryEmailChange).mockResolvedValue({
      ok: true,
      email: "new@example.com",
      codeSentAt: null,
    });
    vi.mocked(recoveryDeliveryService.isConfigured).mockReturnValue(true);
    vi.mocked(recoveryDeliveryService.sendEmail).mockResolvedValue();
    vi.mocked(
      adminAccountRepository.saveRecoveryEmailVerificationCode,
    ).mockResolvedValue();

    await expect(
      recoveryEmailVerificationService.requestCode(
        "current-password",
        "new@example.com",
        now,
      ),
    ).resolves.toMatchObject({
      ok: true,
      pendingEmail: "new@example.com",
      maskedDestination: "ne**@example.com",
    });

    expect(recoveryDeliveryService.sendEmail).toHaveBeenCalledWith(
      "new@example.com",
      expect.stringMatching(/^\d{6}$/),
      "recovery-email-verification",
    );
    expect(
      adminAccountRepository.saveRecoveryEmailVerificationCode,
    ).toHaveBeenCalledWith(
      "new@example.com",
      expect.not.stringMatching(/^\d{6}$/),
      new Date("2026-07-24T09:10:00.000Z"),
      now,
    );
    expect(
      vi.mocked(recoveryDeliveryService.sendEmail).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(
        adminAccountRepository.saveRecoveryEmailVerificationCode,
      ).mock.invocationCallOrder[0],
    );
  });

  it("does not save a pending email when delivery fails", async () => {
    vi.mocked(adminAccountRepository.prepareRecoveryEmailChange).mockResolvedValue({
      ok: true,
      email: "new@example.com",
      codeSentAt: null,
    });
    vi.mocked(recoveryDeliveryService.isConfigured).mockReturnValue(true);
    vi.mocked(recoveryDeliveryService.sendEmail).mockRejectedValue(
      new Error("delivery failed"),
    );

    await expect(
      recoveryEmailVerificationService.requestCode(
        "current-password",
        "new@example.com",
      ),
    ).resolves.toEqual({ ok: false, error: "DELIVERY_FAILED" });
    expect(
      adminAccountRepository.saveRecoveryEmailVerificationCode,
    ).not.toHaveBeenCalled();
  });

  it("rate limits repeated code requests", async () => {
    const now = new Date("2026-07-24T09:00:30.000Z");
    vi.mocked(adminAccountRepository.prepareRecoveryEmailChange).mockResolvedValue({
      ok: true,
      email: "new@example.com",
      codeSentAt: new Date("2026-07-24T09:00:00.000Z"),
    });
    vi.mocked(recoveryDeliveryService.isConfigured).mockReturnValue(true);

    await expect(
      recoveryEmailVerificationService.requestCode(
        "current-password",
        "new@example.com",
        now,
      ),
    ).resolves.toEqual({ ok: false, error: "RATE_LIMITED", retryAfter: 30 });
    expect(recoveryDeliveryService.sendEmail).not.toHaveBeenCalled();
  });

  it("rejects malformed codes before accessing the repository", async () => {
    await expect(
      recoveryEmailVerificationService.verifyCode("12345"),
    ).resolves.toEqual({ ok: false, error: "INVALID_RECOVERY_CODE" });
    expect(
      adminAccountRepository.verifyAndApplyRecoveryEmailChange,
    ).not.toHaveBeenCalled();
  });
});

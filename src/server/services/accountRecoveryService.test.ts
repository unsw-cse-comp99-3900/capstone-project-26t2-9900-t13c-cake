import { beforeEach, describe, expect, it, vi } from "vitest";
import { accountRecoveryService } from "@/server/services/accountRecoveryService";
import { adminAccountRepository } from "@/server/repositories/adminAccountRepository";
import { recoveryDeliveryService } from "@/server/services/recoveryDeliveryService";

vi.mock("@/server/repositories/adminAccountRepository", () => ({
  adminAccountRepository: {
    getRecoveryContacts: vi.fn(),
    getRecoveryRequestState: vi.fn(),
    saveRecoveryCode: vi.fn(),
    resetPasswordWithCode: vi.fn(),
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
    vi.mocked(adminAccountRepository.getRecoveryRequestState).mockReset();
    vi.mocked(adminAccountRepository.saveRecoveryCode).mockReset();
    vi.mocked(adminAccountRepository.resetPasswordWithCode).mockReset();
    vi.mocked(recoveryDeliveryService.isConfigured).mockReset();
    vi.mocked(recoveryDeliveryService.sendEmail).mockReset();
  });

  it("returns masked configured recovery options", async () => {
    vi.mocked(adminAccountRepository.getRecoveryContacts).mockResolvedValue({
      email: "admin@example.com",
    });
    vi.mocked(recoveryDeliveryService.isConfigured).mockReturnValue(true);

    await expect(accountRecoveryService.getPublicOptions()).resolves.toMatchObject({
      email: { available: true, masked: "ad***@example.com" },
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
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/auth/reset-password/route";
import { accountRecoveryService } from "@/server/services/accountRecoveryService";

vi.mock("@/server/services/accountRecoveryService", () => ({
  accountRecoveryService: {
    resetPassword: vi.fn(),
    resetPasswordWithBackupCode: vi.fn(),
  },
}));

describe("POST /api/auth/reset-password with backup recovery code", () => {
  beforeEach(() => {
    vi.mocked(accountRecoveryService.resetPasswordWithBackupCode).mockReset();
  });

  it("resets the account and returns no-store on a valid backup code", async () => {
    vi.mocked(
      accountRecoveryService.resetPasswordWithBackupCode,
    ).mockResolvedValue({ ok: true, username: "new-admin" });

    const response = await POST(
      new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backupRecoveryCode: "ABCD-EFGH-JKMN-PQRS-TVWX",
          newUsername: "new-admin",
          newPassword: "new-secret-pass",
          confirmPassword: "new-secret-pass",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      success: true,
      username: "new-admin",
    });
  });

  it("returns the same generic error for an invalid or unavailable code", async () => {
    vi.mocked(
      accountRecoveryService.resetPasswordWithBackupCode,
    ).mockResolvedValue({ ok: false, error: "INVALID_RECOVERY_CODE" });

    const response = await POST(
      new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backupRecoveryCode: "ABCD-EFGH-JKMN-PQRS-TVW2",
          newUsername: "new-admin",
          newPassword: "new-secret-pass",
          confirmPassword: "new-secret-pass",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Recovery code is invalid or unavailable.",
    });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as requestRecovery } from "@/app/api/auth/recovery/request/route";
import { POST as verifyRecovery } from "@/app/api/auth/recovery/verify/route";
import { accountRecoveryService } from "@/server/services/accountRecoveryService";

vi.mock("@/server/services/accountRecoveryService", () => ({
  accountRecoveryService: {
    requestCode: vi.fn(),
    verifyCode: vi.fn(),
  },
}));

describe("password recovery routes", () => {
  beforeEach(() => {
    vi.mocked(accountRecoveryService.requestCode).mockReset();
    vi.mocked(accountRecoveryService.verifyCode).mockReset();
  });

  it("maps RATE_LIMITED to 429 with Retry-After", async () => {
    vi.mocked(accountRecoveryService.requestCode).mockResolvedValue({
      ok: false,
      error: "RATE_LIMITED",
      retryAfter: 42,
    });

    const response = await requestRecovery();

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("42");
  });

  it("maps DELIVERY_FAILED to 502 and success to a masked destination", async () => {
    vi.mocked(accountRecoveryService.requestCode).mockResolvedValueOnce({
      ok: false,
      error: "DELIVERY_FAILED",
    });
    const failed = await requestRecovery();
    expect(failed.status).toBe(502);

    vi.mocked(accountRecoveryService.requestCode).mockResolvedValueOnce({
      ok: true,
      maskedDestination: "a***@example.com",
      expiresInMinutes: 15,
    });
    const success = await requestRecovery();
    expect(success.status).toBe(200);
    await expect(success.json()).resolves.toEqual({
      ok: true,
      maskedDestination: "a***@example.com",
      expiresInMinutes: 15,
    });
  });

  it("requires a verification code and maps verify errors", async () => {
    const missing = await verifyRecovery(
      new Request("http://localhost/api/auth/recovery/verify", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    expect(missing.status).toBe(400);

    vi.mocked(accountRecoveryService.verifyCode).mockResolvedValue({
      ok: false,
      error: "RECOVERY_CODE_EXPIRED",
    });
    const expired = await verifyRecovery(
      new Request("http://localhost/api/auth/recovery/verify", {
        method: "POST",
        body: JSON.stringify({ verificationCode: "123456" }),
      }),
    );
    expect(expired.status).toBe(400);
    await expect(expired.json()).resolves.toEqual({
      error: "The recovery code has expired. Request a new code.",
    });
  });

  it("returns success when the recovery code is valid", async () => {
    vi.mocked(accountRecoveryService.verifyCode).mockResolvedValue({ ok: true });

    const response = await verifyRecovery(
      new Request("http://localhost/api/auth/recovery/verify", {
        method: "POST",
        body: JSON.stringify({ verificationCode: "123456" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
  });
});

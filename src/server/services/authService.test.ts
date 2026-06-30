import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authService } from "@/server/services/authService";
import { adminAccountRepository } from "@/server/repositories/adminAccountRepository";
import {
  isRecoveryConfigured,
  verifyRecoveryCode,
} from "@/server/utils/recoveryCodeUtils";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/server/services/sessionService";

vi.mock("@/server/repositories/adminAccountRepository", () => ({
  adminAccountRepository: {
    verifyCredentials: vi.fn(),
    changeUsername: vi.fn(),
    changePassword: vi.fn(),
    resetAccount: vi.fn(),
  },
}));

vi.mock("@/server/utils/recoveryCodeUtils", () => ({
  isRecoveryConfigured: vi.fn(),
  verifyRecoveryCode: vi.fn(),
}));

describe("authService (CAKE-10)", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_USERNAME", "admin");
    vi.stubEnv("ADMIN_PASSWORD", "secret-pass");
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
    vi.mocked(adminAccountRepository.verifyCredentials).mockReset();
    vi.mocked(adminAccountRepository.changeUsername).mockReset();
    vi.mocked(adminAccountRepository.changePassword).mockReset();
    vi.mocked(adminAccountRepository.resetAccount).mockReset();
    vi.mocked(isRecoveryConfigured).mockReset();
    vi.mocked(verifyRecoveryCode).mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports configured auth when env vars are present", () => {
    expect(authService.isConfigured()).toBe(true);
  });

  it("verifies valid credentials via the repository", async () => {
    vi.mocked(adminAccountRepository.verifyCredentials).mockResolvedValue(true);

    await expect(authService.verifyCredentials("admin", "secret-pass")).resolves.toBe(true);
    expect(adminAccountRepository.verifyCredentials).toHaveBeenCalledWith("admin", "secret-pass");
  });

  it("rejects invalid credentials via the repository", async () => {
    vi.mocked(adminAccountRepository.verifyCredentials).mockResolvedValue(false);

    await expect(authService.verifyCredentials("admin", "wrong-pass")).resolves.toBe(false);
  });

  it("reads an authenticated session from request cookies", () => {
    const token = createSessionToken("admin");
    const request = new Request("http://localhost/api/auth/session", {
      headers: {
        cookie: `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
      },
    });

    const session = authService.getSessionFromRequest(request);
    expect(session?.username).toBe("admin");
  });

  it("returns false for configuration when session secret is missing", () => {
    vi.unstubAllEnvs();
    vi.stubEnv("ADMIN_PASSWORD", "secret-pass");

    expect(authService.isConfigured()).toBe(false);
  });

  it("delegates username changes to the repository", async () => {
    vi.mocked(adminAccountRepository.changeUsername).mockResolvedValue({
      ok: true,
      username: "maintainer",
    });

    await expect(authService.changeUsername("secret-pass", "maintainer")).resolves.toEqual({
      ok: true,
      username: "maintainer",
    });
  });

  it("delegates password changes to the repository", async () => {
    vi.mocked(adminAccountRepository.changePassword).mockResolvedValue({ ok: true });

    await expect(authService.changePassword("secret-pass", "new-secret-pass")).resolves.toEqual({
      ok: true,
    });
  });

  it("resets the account when the recovery code is valid", async () => {
    vi.mocked(isRecoveryConfigured).mockReturnValue(true);
    vi.mocked(verifyRecoveryCode).mockReturnValue(true);
    vi.mocked(adminAccountRepository.resetAccount).mockResolvedValue({
      ok: true,
      username: "admin",
    });

    await expect(
      authService.resetAccountWithRecovery("recovery-code", "admin", "new-secret-pass"),
    ).resolves.toEqual({ ok: true, username: "admin" });
  });

  it("rejects account reset when the recovery code is invalid", async () => {
    vi.mocked(isRecoveryConfigured).mockReturnValue(true);
    vi.mocked(verifyRecoveryCode).mockReturnValue(false);

    await expect(
      authService.resetAccountWithRecovery("wrong-code", "admin", "new-secret-pass"),
    ).resolves.toEqual({ ok: false, error: "INVALID_RECOVERY_CODE" });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/auth/session/route";
import { authService } from "@/server/services/authService";
import { backupRecoveryService } from "@/server/services/backupRecoveryService";

vi.mock("@/server/services/authService", () => ({
  authService: {
    isConfigured: vi.fn(),
    getSessionFromRequest: vi.fn(),
  },
}));

vi.mock("@/server/services/backupRecoveryService", () => ({
  backupRecoveryService: {
    getStatus: vi.fn(),
  },
}));

describe("GET /api/auth/session", () => {
  beforeEach(() => {
    vi.mocked(authService.isConfigured).mockReturnValue(true);
    vi.mocked(authService.getSessionFromRequest).mockReset();
    vi.mocked(backupRecoveryService.getStatus).mockReset();
  });

  it("returns the backup recovery setup requirement for an admin session", async () => {
    vi.mocked(authService.getSessionFromRequest).mockReturnValue({
      username: "admin",
      exp: Date.now() + 1_000,
    });
    vi.mocked(backupRecoveryService.getStatus).mockResolvedValue({
      setupRequired: true,
      createdAt: null,
      confirmedAt: null,
    });

    const response = await GET(
      new Request("http://localhost/api/auth/session"),
    );

    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      authenticated: true,
      configured: true,
      username: "admin",
      backupRecoverySetupRequired: true,
    });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/auth/recovery/options/route";
import { accountRecoveryService } from "@/server/services/accountRecoveryService";

vi.mock("@/server/services/accountRecoveryService", () => ({
  accountRecoveryService: {
    getPublicOptions: vi.fn(),
  },
}));

describe("GET /api/auth/recovery/options", () => {
  beforeEach(() => {
    vi.mocked(accountRecoveryService.getPublicOptions).mockReset();
  });

  it("returns masked public recovery options", async () => {
    vi.mocked(accountRecoveryService.getPublicOptions).mockResolvedValue({
      email: { available: true, masked: "a***@example.com" },
      backupRecoveryCode: true,
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      email: { available: true, masked: "a***@example.com" },
      backupRecoveryCode: true,
    });
  });
});

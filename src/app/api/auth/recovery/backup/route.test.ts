import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { POST as generateBackupCode } from "@/app/api/auth/recovery/backup/generate/route";
import { POST as confirmBackupCode } from "@/app/api/auth/recovery/backup/confirm/route";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { backupRecoveryService } from "@/server/services/backupRecoveryService";

vi.mock("@/server/middleware/authMiddleware", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/server/services/backupRecoveryService", () => ({
  backupRecoveryService: {
    generate: vi.fn(),
    confirm: vi.fn(),
  },
}));

describe("backup recovery setup routes", () => {
  beforeEach(() => {
    vi.mocked(requireAdmin).mockReset();
    vi.mocked(backupRecoveryService.generate).mockReset();
    vi.mocked(backupRecoveryService.confirm).mockReset();
  });

  it("requires an authenticated admin to generate a code", async () => {
    vi.mocked(requireAdmin).mockReturnValue({
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });

    const response = await generateBackupCode(
      new Request("http://localhost/api/auth/recovery/backup/generate", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(401);
    expect(backupRecoveryService.generate).not.toHaveBeenCalled();
  });

  it("returns a generated code once with no-store caching", async () => {
    vi.mocked(requireAdmin).mockReturnValue({
      session: { username: "admin", exp: Date.now() + 1_000 },
    });
    vi.mocked(backupRecoveryService.generate).mockResolvedValue({
      recoveryCode: "ABCD-EFGH-JKMN-PQRS-TVWX",
      createdAt: "2026-07-23T10:00:00.000Z",
    });

    const response = await generateBackupCode(
      new Request("http://localhost/api/auth/recovery/backup/generate", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      recoveryCode: "ABCD-EFGH-JKMN-PQRS-TVWX",
      createdAt: "2026-07-23T10:00:00.000Z",
    });
  });

  it("confirms the matching generated code", async () => {
    vi.mocked(requireAdmin).mockReturnValue({
      session: { username: "admin", exp: Date.now() + 1_000 },
    });
    vi.mocked(backupRecoveryService.confirm).mockResolvedValue({ ok: true });

    const response = await confirmBackupCode(
      new Request("http://localhost/api/auth/recovery/backup/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createdAt: "2026-07-23T10:00:00.000Z" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ success: true });
  });

  it("rejects a stale or invalid confirmation", async () => {
    vi.mocked(requireAdmin).mockReturnValue({
      session: { username: "admin", exp: Date.now() + 1_000 },
    });
    vi.mocked(backupRecoveryService.confirm).mockResolvedValue({
      ok: false,
      error: "RECOVERY_CODE_UNAVAILABLE",
    });

    const response = await confirmBackupCode(
      new Request("http://localhost/api/auth/recovery/backup/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createdAt: "stale" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Recovery code is unavailable. Generate a new code.",
    });
  });
});

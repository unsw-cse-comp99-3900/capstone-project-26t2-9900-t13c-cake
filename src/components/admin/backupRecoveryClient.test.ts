import { describe, expect, it, vi } from "vitest";
import {
  confirmBackupRecoveryCode,
  generateBackupRecoveryCode,
} from "@/components/admin/backupRecoveryClient";

describe("backupRecoveryClient", () => {
  it("requests and parses a generated recovery code", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({
        recoveryCode: "ABCD-EFGH-JKMN-PQRS-TVWX",
        createdAt: "2026-07-23T10:00:00.000Z",
      }),
    );

    await expect(generateBackupRecoveryCode(fetcher)).resolves.toEqual({
      recoveryCode: "ABCD-EFGH-JKMN-PQRS-TVWX",
      createdAt: "2026-07-23T10:00:00.000Z",
    });
    expect(fetcher).toHaveBeenCalledWith(
      "/api/auth/recovery/backup/generate",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("sends the generation timestamp when confirming safe storage", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ success: true }));

    await expect(
      confirmBackupRecoveryCode("2026-07-23T10:00:00.000Z", fetcher),
    ).resolves.toBeUndefined();
    expect(fetcher).toHaveBeenCalledWith(
      "/api/auth/recovery/backup/confirm",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ createdAt: "2026-07-23T10:00:00.000Z" }),
      }),
    );
  });

  it("surfaces the server error without exposing response details", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json(
        { error: "Recovery code is unavailable. Generate a new code." },
        { status: 400 },
      ),
    );

    await expect(generateBackupRecoveryCode(fetcher)).rejects.toThrow(
      "Recovery code is unavailable. Generate a new code.",
    );
  });
});

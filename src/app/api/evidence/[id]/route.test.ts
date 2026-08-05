import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, PUT } from "@/app/api/evidence/[id]/route";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { evidenceService } from "@/server/services/evidenceService";

vi.mock("@/server/middleware/authMiddleware", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/server/services/evidenceService", () => ({
  evidenceService: {
    updateEvidence: vi.fn(),
    deleteEvidence: vi.fn(),
  },
}));

const context = { params: Promise.resolve({ id: "rec-1" }) };

describe("/api/evidence/[id]", () => {
  beforeEach(() => {
    vi.mocked(requireAdmin).mockReset();
    vi.mocked(evidenceService.updateEvidence).mockReset();
    vi.mocked(evidenceService.deleteEvidence).mockReset();
  });

  it("requires admin for update and delete", async () => {
    vi.mocked(requireAdmin).mockReturnValue({
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    } as never);

    const update = await PUT(
      new Request("http://localhost/api/evidence/rec-1", {
        method: "PUT",
        body: JSON.stringify({}),
      }),
      context,
    );
    const remove = await DELETE(
      new Request("http://localhost/api/evidence/rec-1", { method: "DELETE" }),
      context,
    );

    expect(update.status).toBe(401);
    expect(remove.status).toBe(401);
  });

  it("updates evidence and maps validation errors", async () => {
    vi.mocked(requireAdmin).mockReturnValue({
      session: { username: "admin", exp: Date.now() + 1000 },
    } as never);
    vi.mocked(evidenceService.updateEvidence).mockResolvedValueOnce({ id: "rec-1" } as never);

    const success = await PUT(
      new Request("http://localhost/api/evidence/rec-1", {
        method: "PUT",
        body: JSON.stringify({ title: "Updated" }),
      }),
      context,
    );
    expect(success.status).toBe(200);

    vi.mocked(evidenceService.updateEvidence).mockRejectedValueOnce(
      new Error("title is required"),
    );
    const failed = await PUT(
      new Request("http://localhost/api/evidence/rec-1", {
        method: "PUT",
        body: JSON.stringify({}),
      }),
      context,
    );
    expect(failed.status).toBe(400);
    await expect(failed.json()).resolves.toEqual({ error: "title is required" });
  });

  it("soft-deletes evidence records", async () => {
    vi.mocked(requireAdmin).mockReturnValue({
      session: { username: "admin", exp: Date.now() + 1000 },
    } as never);
    vi.mocked(evidenceService.deleteEvidence).mockResolvedValue(undefined);

    const response = await DELETE(
      new Request("http://localhost/api/evidence/rec-1", { method: "DELETE" }),
      context,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(evidenceService.deleteEvidence).toHaveBeenCalledWith("rec-1");
  });
});

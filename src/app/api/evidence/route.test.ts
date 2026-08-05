import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/evidence/route";
import { GET as exportEvidence } from "@/app/api/evidence/export/route";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { evidenceService } from "@/server/services/evidenceService";
import { excelParseService } from "@/server/services/excelParseService";

vi.mock("@/server/middleware/authMiddleware", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/server/services/evidenceService", () => ({
  evidenceService: {
    listPublicEvidence: vi.fn(),
    listAllActiveEvidence: vi.fn(),
    createEvidence: vi.fn(),
  },
}));

vi.mock("@/server/services/excelParseService", () => ({
  excelParseService: {
    createEvidenceWorkbook: vi.fn(() => new ArrayBuffer(8)),
  },
}));

describe("/api/evidence", () => {
  beforeEach(() => {
    vi.mocked(requireAdmin).mockReset();
    vi.mocked(evidenceService.listPublicEvidence).mockReset();
    vi.mocked(evidenceService.listAllActiveEvidence).mockReset();
    vi.mocked(evidenceService.createEvidence).mockReset();
    vi.mocked(excelParseService.createEvidenceWorkbook).mockClear();
  });

  it("returns public evidence lists", async () => {
    vi.mocked(evidenceService.listPublicEvidence).mockResolvedValue([]);

    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
  });

  it("returns 500 when listing fails", async () => {
    vi.mocked(evidenceService.listPublicEvidence).mockRejectedValue(new Error("db down"));

    const response = await GET();
    expect(response.status).toBe(500);
  });

  it("requires admin for create and maps validation errors", async () => {
    vi.mocked(requireAdmin).mockReturnValueOnce({
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    } as never);

    const unauthorized = await POST(
      new Request("http://localhost/api/evidence", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    expect(unauthorized.status).toBe(401);

    vi.mocked(requireAdmin).mockReturnValue({
      session: { username: "admin", exp: Date.now() + 1000 },
    } as never);
    vi.mocked(evidenceService.createEvidence).mockRejectedValue(new Error("title is required"));

    const invalid = await POST(
      new Request("http://localhost/api/evidence", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    expect(invalid.status).toBe(400);
    await expect(invalid.json()).resolves.toEqual({ error: "title is required" });
  });

  it("creates evidence as admin with 201", async () => {
    vi.mocked(requireAdmin).mockReturnValue({
      session: { username: "admin", exp: Date.now() + 1000 },
    } as never);
    vi.mocked(evidenceService.createEvidence).mockResolvedValue({ id: "rec-1" } as never);

    const response = await POST(
      new Request("http://localhost/api/evidence", {
        method: "POST",
        body: JSON.stringify({ title: "Guidance" }),
      }),
    );

    expect(response.status).toBe(201);
  });
});

describe("GET /api/evidence/export", () => {
  beforeEach(() => {
    vi.mocked(requireAdmin).mockReset();
    vi.mocked(evidenceService.listAllActiveEvidence).mockReset();
    vi.mocked(excelParseService.createEvidenceWorkbook).mockClear();
  });

  it("requires admin", async () => {
    vi.mocked(requireAdmin).mockReturnValue({
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    } as never);

    const response = await exportEvidence(new Request("http://localhost/api/evidence/export"));
    expect(response.status).toBe(401);
  });

  it("exports a template workbook when template=true", async () => {
    vi.mocked(requireAdmin).mockReturnValue({
      session: { username: "admin", exp: Date.now() + 1000 },
    } as never);

    const response = await exportEvidence(
      new Request("http://localhost/api/evidence/export?template=true"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toContain("evidence-template.xlsx");
    expect(excelParseService.createEvidenceWorkbook).toHaveBeenCalledWith([]);
  });

  it("exports active records by default", async () => {
    vi.mocked(requireAdmin).mockReturnValue({
      session: { username: "admin", exp: Date.now() + 1000 },
    } as never);
    vi.mocked(evidenceService.listAllActiveEvidence).mockResolvedValue([{ id: "rec-1" } as never]);

    const response = await exportEvidence(new Request("http://localhost/api/evidence/export"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toContain("evidence-records.xlsx");
    expect(excelParseService.createEvidenceWorkbook).toHaveBeenCalledWith([{ id: "rec-1" }]);
  });
});

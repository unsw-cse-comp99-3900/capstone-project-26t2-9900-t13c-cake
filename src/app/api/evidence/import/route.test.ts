import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/evidence/import/route";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import {
  EvidenceImportConflictError,
} from "@/server/repositories/evidenceRepository";
import { evidenceService } from "@/server/services/evidenceService";
import {
  ExcelParseError,
  excelParseService,
} from "@/server/services/excelParseService";

vi.mock("@/server/middleware/authMiddleware", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/server/services/evidenceService", () => ({
  evidenceService: {
    listAllActiveEvidence: vi.fn(),
    applyExcelImport: vi.fn(),
  },
}));

vi.mock("@/server/services/excelParseService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/services/excelParseService")>();
  return {
    ...actual,
    excelParseService: {
      parseWorkbook: vi.fn(),
      createEvidenceWorkbook: vi.fn(),
    },
  };
});

function adminAuth() {
  vi.mocked(requireAdmin).mockReturnValue({
    session: { username: "admin", exp: Date.now() + 1000 },
  } as never);
}

function excelFormData(fileName = "evidence.xlsx") {
  const formData = new FormData();
  formData.append(
    "file",
    new File([new Uint8Array([1, 2, 3])], fileName, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  return formData;
}

describe("POST /api/evidence/import", () => {
  beforeEach(() => {
    vi.mocked(requireAdmin).mockReset();
    vi.mocked(evidenceService.listAllActiveEvidence).mockReset();
    vi.mocked(evidenceService.applyExcelImport).mockReset();
    vi.mocked(excelParseService.parseWorkbook).mockReset();
  });

  it("returns 401 without admin", async () => {
    vi.mocked(requireAdmin).mockReturnValue({
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    } as never);

    const response = await POST(
      new Request("http://localhost/api/evidence/import", {
        method: "POST",
        body: excelFormData(),
      }),
    );
    expect(response.status).toBe(401);
  });

  it("returns 400 when the upload is not exactly one xlsx file", async () => {
    adminAuth();
    const formData = new FormData();
    formData.append("file", new File(["x"], "notes.txt", { type: "text/plain" }));

    const response = await POST(
      new Request("http://localhost/api/evidence/import", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/exactly one \.xlsx/i),
    });
  });

  it("returns a preview summary without applying", async () => {
    adminAuth();
    vi.mocked(excelParseService.parseWorkbook).mockReturnValue([
      {
        id: "",
        publisher: "NSW Health",
        title: "Guidance",
        year: 2024,
        link: null,
        jurisdictions: "NSW",
        context: "Research",
        subCategory: null,
        engagementLevel: "3",
        minHourlyRate: 40,
        maxHourlyRate: 60,
        reimbursementGuidance: false,
        unpaidEngagementGuidance: false,
        exampleOrganisations: null,
      },
    ]);
    vi.mocked(evidenceService.listAllActiveEvidence).mockResolvedValue([]);

    const response = await POST(
      new Request("http://localhost/api/evidence/import", {
        method: "POST",
        body: excelFormData(),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      totalRows: 1,
      createCount: 1,
      updateCount: 0,
      invalidCount: 0,
    });
    expect(evidenceService.applyExcelImport).not.toHaveBeenCalled();
  });

  it("applies valid rows and rejects apply when invalid rows exist", async () => {
    adminAuth();
    vi.mocked(excelParseService.parseWorkbook).mockReturnValue([
      {
        id: "missing",
        publisher: "NSW Health",
        title: "Guidance",
        year: 2024,
        link: null,
        jurisdictions: "NSW",
        context: "Research",
        subCategory: null,
        engagementLevel: "3",
        minHourlyRate: 40,
        maxHourlyRate: 60,
        reimbursementGuidance: false,
        unpaidEngagementGuidance: false,
        exampleOrganisations: null,
      },
    ]);
    vi.mocked(evidenceService.listAllActiveEvidence).mockResolvedValue([]);

    const blocked = await POST(
      new Request("http://localhost/api/evidence/import?apply=true", {
        method: "POST",
        body: excelFormData(),
      }),
    );
    expect(blocked.status).toBe(400);

    vi.mocked(excelParseService.parseWorkbook).mockReturnValue([
      {
        id: "",
        publisher: "NSW Health",
        title: "Guidance",
        year: 2024,
        link: null,
        jurisdictions: "NSW",
        context: "Research",
        subCategory: null,
        engagementLevel: "3",
        minHourlyRate: 40,
        maxHourlyRate: 60,
        reimbursementGuidance: false,
        unpaidEngagementGuidance: false,
        exampleOrganisations: null,
      },
    ]);
    vi.mocked(evidenceService.applyExcelImport).mockResolvedValue({
      createdCount: 1,
      updatedCount: 0,
    });

    const applied = await POST(
      new Request("http://localhost/api/evidence/import?apply=true", {
        method: "POST",
        body: excelFormData(),
      }),
    );

    expect(applied.status).toBe(200);
    await expect(applied.json()).resolves.toEqual({
      totalRows: 1,
      createdCount: 1,
      updatedCount: 0,
      invalidCount: 0,
    });
  });

  it("maps ExcelParseError to 400 and import conflicts to 409", async () => {
    adminAuth();
    vi.mocked(excelParseService.parseWorkbook).mockImplementationOnce(() => {
      throw new ExcelParseError("Excel headers do not match the expected Evidence columns");
    });

    const badHeaders = await POST(
      new Request("http://localhost/api/evidence/import", {
        method: "POST",
        body: excelFormData(),
      }),
    );
    expect(badHeaders.status).toBe(400);

    vi.mocked(excelParseService.parseWorkbook).mockReturnValue([
      {
        id: "",
        publisher: "NSW Health",
        title: "Guidance",
        year: 2024,
        link: null,
        jurisdictions: "NSW",
        context: "Research",
        subCategory: null,
        engagementLevel: "3",
        minHourlyRate: 40,
        maxHourlyRate: 60,
        reimbursementGuidance: false,
        unpaidEngagementGuidance: false,
        exampleOrganisations: null,
      },
    ]);
    vi.mocked(evidenceService.listAllActiveEvidence).mockResolvedValue([]);
    vi.mocked(evidenceService.applyExcelImport).mockRejectedValue(
      new EvidenceImportConflictError("rec-x"),
    );

    const conflict = await POST(
      new Request("http://localhost/api/evidence/import?apply=true", {
        method: "POST",
        body: excelFormData(),
      }),
    );
    expect(conflict.status).toBe(409);
  });
});

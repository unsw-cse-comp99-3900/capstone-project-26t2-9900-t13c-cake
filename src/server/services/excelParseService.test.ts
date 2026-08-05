import { describe, expect, it } from "vitest";
import {
  EVIDENCE_EXCEL_COLUMNS,
  ExcelParseError,
  excelParseService,
  type ExcelEvidenceRow,
} from "@/server/services/excelParseService";
import * as XLSX from "xlsx";

function sampleRow(overrides: Partial<ExcelEvidenceRow> = {}): ExcelEvidenceRow {
  return {
    id: "rec-1",
    publisher: "NSW Health",
    title: "Consumer remuneration guidance",
    year: 2024,
    link: "https://example.org/guide",
    jurisdictions: "NSW",
    context: "Research",
    subCategory: "Clinical trials",
    engagementLevel: "3",
    minHourlyRate: 40.5,
    maxHourlyRate: 60,
    reimbursementGuidance: true,
    unpaidEngagementGuidance: false,
    exampleOrganisations: "Example Org",
    ...overrides,
  };
}

function workbookFromRows(headers: string[], rows: unknown[][] = []): ArrayBuffer {
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Evidence");
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" }) as Uint8Array;
  return Uint8Array.from(output).buffer;
}

describe("excelParseService (CAKE-12)", () => {
  it("round-trips typed evidence rows through createEvidenceWorkbook and parseWorkbook", () => {
    const original = [
      sampleRow(),
      sampleRow({
        id: "",
        year: null,
        link: null,
        subCategory: null,
        minHourlyRate: null,
        maxHourlyRate: null,
        exampleOrganisations: null,
        reimbursementGuidance: false,
        unpaidEngagementGuidance: true,
      }),
    ];

    const buffer = excelParseService.createEvidenceWorkbook(original);
    const parsed = excelParseService.parseWorkbook(buffer);

    expect(parsed).toEqual(original);
  });

  it("parses boolean and numeric cell variants", () => {
    const buffer = workbookFromRows([...EVIDENCE_EXCEL_COLUMNS], [
      [
        "",
        "Publisher",
        "Title",
        "2024",
        "https://example.org",
        "National",
        "Research",
        "",
        "2",
        "35",
        "bad-rate",
        "yes",
        "1",
        "",
      ],
    ]);

    const [row] = excelParseService.parseWorkbook(buffer);

    expect(row.year).toBe(2024);
    expect(row.minHourlyRate).toBe(35);
    expect(Number.isNaN(row.maxHourlyRate)).toBe(true);
    expect(row.reimbursementGuidance).toBe(true);
    expect(row.unpaidEngagementGuidance).toBe(true);
  });

  it("throws ExcelParseError when headers are missing or reordered", () => {
    const missingId = workbookFromRows(
      EVIDENCE_EXCEL_COLUMNS.filter((column) => column !== "id"),
    );

    expect(() => excelParseService.parseWorkbook(missingId)).toThrow(ExcelParseError);

    try {
      excelParseService.parseWorkbook(missingId);
    } catch (error) {
      expect(error).toBeInstanceOf(ExcelParseError);
      const details = (error as ExcelParseError).details;
      expect(details?.missing).toContain("id");
    }

    const reordered = workbookFromRows(["publisher", ...EVIDENCE_EXCEL_COLUMNS.slice(0, -1)]);
    expect(() => excelParseService.parseWorkbook(reordered)).toThrow(/headers do not match/i);
  });

  it("throws when the workbook buffer is unreadable", () => {
    expect(() => excelParseService.parseWorkbook(new ArrayBuffer(8))).toThrow();
  });

  it("creates a template workbook with headers only", () => {
    const buffer = excelParseService.createEvidenceWorkbook();
    const parsed = excelParseService.parseWorkbook(buffer);
    expect(parsed).toEqual([]);
  });
});

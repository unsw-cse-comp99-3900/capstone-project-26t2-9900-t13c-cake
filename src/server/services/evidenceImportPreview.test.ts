import { describe, expect, it } from "vitest";
import { buildEvidenceImportPreview } from "@/server/services/evidenceImportPreview";
import type { ExcelEvidenceRow } from "@/server/services/excelParseService";

function row(overrides: Partial<ExcelEvidenceRow> = {}): ExcelEvidenceRow {
  return {
    id: "",
    publisher: "NSW Health",
    title: "Guidance",
    year: 2024,
    link: "https://example.org/guide",
    jurisdictions: "NSW",
    context: "Research",
    subCategory: null,
    engagementLevel: "3",
    minHourlyRate: 40,
    maxHourlyRate: 60,
    reimbursementGuidance: true,
    unpaidEngagementGuidance: false,
    exampleOrganisations: null,
    ...overrides,
  };
}

describe("buildEvidenceImportPreview", () => {
  it("classifies blank ids as create and known ids as update", () => {
    const summary = buildEvidenceImportPreview(
      [row({ id: "" }), row({ id: "rec-1", title: "Updated" })],
      [{ id: "rec-1" }],
    );

    expect(summary).toMatchObject({
      totalRows: 2,
      createCount: 1,
      updateCount: 1,
      invalidCount: 0,
    });
    expect(summary.rows.map((item) => item.action)).toEqual(["create", "update"]);
    expect(summary.rows[0]?.rowNumber).toBe(2);
  });

  it("marks unknown ids and invalid field values as invalid", () => {
    const summary = buildEvidenceImportPreview(
      [
        row({ id: "missing-id" }),
        row({ id: "", publisher: "", title: "" }),
      ],
      [{ id: "rec-1" }],
    );

    expect(summary.invalidCount).toBe(2);
    expect(summary.createCount).toBe(0);
    expect(summary.updateCount).toBe(0);
    expect(summary.rows[0]?.errors).toContain(
      'No active EvidenceRecord found for id "missing-id"',
    );
    expect(summary.rows[1]?.errors).toEqual(
      expect.arrayContaining(["publisher is required", "title is required"]),
    );
  });
});

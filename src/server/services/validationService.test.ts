import { describe, expect, it } from "vitest";
import { validationService } from "@/server/services/validationService";
import type { ExcelEvidenceRow } from "@/server/services/excelParseService";

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    publisher: "NSW Health",
    title: "Consumer remuneration guidance",
    year: 2024,
    link: "https://example.org/guide",
    jurisdictions: "NSW",
    context: "Research",
    subCategory: "Clinical trials",
    engagementLevel: "3",
    minHourlyRate: 40,
    maxHourlyRate: 60,
    reimbursementGuidance: true,
    unpaidEngagementGuidance: false,
    exampleOrganisations: "Example Org",
    ...overrides,
  };
}

function excelRow(overrides: Partial<ExcelEvidenceRow> = {}): ExcelEvidenceRow {
  return {
    id: "",
    publisher: "NSW Health",
    title: "Consumer remuneration guidance",
    year: 2024,
    link: "https://example.org/guide",
    jurisdictions: "NSW",
    context: "Research",
    subCategory: "Clinical trials",
    engagementLevel: "3",
    minHourlyRate: 40,
    maxHourlyRate: 60,
    reimbursementGuidance: true,
    unpaidEngagementGuidance: false,
    exampleOrganisations: "Example Org",
    ...overrides,
  };
}

describe("validationService (CAKE-11)", () => {
  it("accepts a valid payload and trims string fields", () => {
    const result = validationService.validateEvidencePayload(
      validPayload({
        publisher: "  NSW Health  ",
        title: "  Guidance  ",
        link: "  https://example.org/guide  ",
      }),
    );

    expect(result).toMatchObject({
      publisher: "NSW Health",
      title: "Guidance",
      link: "https://example.org/guide",
      jurisdictions: "NSW",
      engagementLevel: "3",
      minHourlyRate: 40,
      maxHourlyRate: 60,
      reimbursementGuidance: true,
      unpaidEngagementGuidance: false,
    });
  });

  it("coerces boolean fields from form-style values", () => {
    const result = validationService.validateEvidencePayload(
      validPayload({
        reimbursementGuidance: "on",
        unpaidEngagementGuidance: 1,
      }),
    );

    expect(result.reimbursementGuidance).toBe(true);
    expect(result.unpaidEngagementGuidance).toBe(true);
  });

  it("rejects non-object payloads", () => {
    expect(() => validationService.validateEvidencePayload(null)).toThrow(
      "Evidence payload must be an object",
    );
    expect(() => validationService.validateEvidencePayload([])).toThrow(
      "Evidence payload must be an object",
    );
  });

  it("rejects unsupported jurisdictions and invalid engagement levels", () => {
    expect(() =>
      validationService.validateEvidencePayload(validPayload({ jurisdictions: "California" })),
    ).toThrow(/supported jurisdiction/i);

    expect(() =>
      validationService.validateEvidencePayload(validPayload({ engagementLevel: "0" })),
    ).toThrow(/positive whole number/i);
  });

  it("rejects negative rates and min greater than max", () => {
    expect(() =>
      validationService.validateEvidencePayload(validPayload({ minHourlyRate: -1 })),
    ).toThrow(/minHourlyRate must not be negative/i);

    expect(() =>
      validationService.validateEvidencePayload(
        validPayload({ minHourlyRate: 80, maxHourlyRate: 40 }),
      ),
    ).toThrow(/less than or equal to maxHourlyRate/i);
  });

  it("accumulates Excel row validation errors", () => {
    const errors = validationService.validateExcelEvidenceRow(
      excelRow({
        publisher: "",
        title: " ",
        jurisdictions: "",
        context: "",
        engagementLevel: "",
        year: 2024.5,
        minHourlyRate: Number.NaN,
        maxHourlyRate: 10,
        link: "not-a-url",
      }),
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        "publisher is required",
        "title is required",
        "jurisdictions is required",
        "context is required",
        "engagementLevel is required",
        "year must be a valid whole number if present",
        "minHourlyRate must be a valid number if present",
        "link must be a valid URL if present",
      ]),
    );
  });

  it("flags Excel rows where min rate exceeds max rate", () => {
    const errors = validationService.validateExcelEvidenceRow(
      excelRow({ minHourlyRate: 90, maxHourlyRate: 20 }),
    );

    expect(errors).toContain("minHourlyRate must be less than or equal to maxHourlyRate");
  });

  it("accepts a valid Excel evidence row with no errors", () => {
    expect(validationService.validateExcelEvidenceRow(excelRow())).toEqual([]);
  });
});

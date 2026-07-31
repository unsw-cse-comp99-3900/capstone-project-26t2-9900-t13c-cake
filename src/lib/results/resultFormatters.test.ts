import { describe, expect, it } from "vitest";
import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import {
  buildResultsPdfFilename,
  formatBooleanGuidance,
  formatFilterSummary,
  formatRateRange,
  formatResultSummary,
} from "./resultFormatters";

const sampleRecord: EvidenceRecordDTO = {
  id: "record-1",
  publisher: "NSW Ministry of Health",
  title: "Consumer Engagement Remuneration Framework",
  year: 2022,
  jurisdictions: "NSW",
  context: "Committees and boards",
  subCategory: null,
  engagementLevel: "2",
  minHourlyRate: 45,
  maxHourlyRate: 65,
  reimbursementGuidance: true,
  unpaidEngagementGuidance: true,
  exampleOrganisations: "Local health districts",
  link: "https://example.org/framework",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

describe("resultFormatters (CAKE-14)", () => {
  it("formats result summaries with singular and plural wording", () => {
    expect(formatResultSummary(1)).toBe("1 result best matches your selections");
    expect(formatResultSummary(3)).toBe("3 results best match your selections");
  });

  it("formats filter summaries", () => {
    expect(
      formatFilterSummary({
        jurisdictions: ["NSW", "VIC"],
        context: "Committees and boards",
        subCategory: "Advisory group",
        engagementLevel: "2",
      }),
    ).toBe("NSW, VIC / Committees and boards / Advisory group / 2");
  });

  it("formats hourly rate ranges", () => {
    expect(formatRateRange(sampleRecord)).toBe("$45-$65/hr");
    expect(
      formatRateRange({
        ...sampleRecord,
        minHourlyRate: 50,
        maxHourlyRate: 50,
      }),
    ).toBe("$50/hr");
    expect(
      formatRateRange({
        ...sampleRecord,
        minHourlyRate: null,
        maxHourlyRate: null,
      }),
    ).toBe("Not specified");
  });

  it("formats boolean guidance labels", () => {
    expect(formatBooleanGuidance(true)).toBe("Included");
    expect(formatBooleanGuidance(false)).toBe("Not included");
  });

  it("builds a dated PDF filename", () => {
    expect(buildResultsPdfFilename(new Date("2026-06-16T10:00:00.000Z"))).toBe(
      "remuneration-results-2026-06-16.pdf",
    );
  });
});

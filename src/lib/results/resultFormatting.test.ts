import assert from "node:assert/strict";
import { test } from "vitest";
import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import {
  formatBoolean,
  formatRateRange,
  toggleComparisonSelection,
} from "./resultFormatting";

function evidence(overrides: Partial<EvidenceRecordDTO> = {}): EvidenceRecordDTO {
  return {
    id: "record-1",
    publisher: "Publisher",
    title: "Guidance",
    year: 2026,
    link: null,
    jurisdictions: "NSW",
    context: "General Public",
    subCategory: null,
    engagementLevel: "2",
    minHourlyRate: 50,
    maxHourlyRate: 100,
    reimbursementGuidance: true,
    unpaidEngagementGuidance: false,
    exampleOrganisations: null,
    createdAt: new Date("2026-06-01T00:00:00Z"),
    updatedAt: new Date("2026-06-01T00:00:00Z"),
    ...overrides,
  };
}

test("formats missing and partial hourly rates for result display", () => {
  assert.equal(
    formatRateRange(evidence({ minHourlyRate: null, maxHourlyRate: null })),
    "Not specified",
  );
  assert.equal(formatRateRange(evidence({ minHourlyRate: 75, maxHourlyRate: 75 })), "$75/hr");
  assert.equal(formatRateRange(evidence({ minHourlyRate: null, maxHourlyRate: 100 })), "$?-$100/hr");
});

test("formats boolean guidance flags", () => {
  assert.equal(formatBoolean(true), "Included");
  assert.equal(formatBoolean(false), "Not included");
});

test("toggles comparison selections without exceeding the comparison limit", () => {
  assert.deepEqual(toggleComparisonSelection(["a"], "b", 3), ["a", "b"]);
  assert.deepEqual(toggleComparisonSelection(["a", "b"], "a", 3), ["b"]);
  assert.deepEqual(toggleComparisonSelection(["a", "b"], "c", 2), ["a", "b"]);
});

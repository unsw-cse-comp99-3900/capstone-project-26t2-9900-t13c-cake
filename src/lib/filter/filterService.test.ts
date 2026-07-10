import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { test } from "vitest";
import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import {
  filterEvidence,
  filterEvidenceGroups,
  getAvailableSubCategories,
  type QuizFilters,
} from "./filterService";

const baseFilters: QuizFilters = {
  jurisdictions: ["NSW"],
  context: "Mental Health",
  subCategory: null,
  engagementLevel: "Consult",
};

function evidence(
  id: string,
  overrides: Partial<EvidenceRecordDTO> = {},
): EvidenceRecordDTO {
  return {
    id,
    publisher: `Publisher ${id}`,
    title: `Guidance ${id}`,
    year: 2025,
    link: null,
    jurisdictions: "NSW",
    context: "Mental Health",
    subCategory: null,
    engagementLevel: "Consult",
    minHourlyRate: 40,
    maxHourlyRate: 80,
    reimbursementGuidance: true,
    unpaidEngagementGuidance: false,
    exampleOrganisations: null,
    createdAt: new Date("2026-06-01T00:00:00Z"),
    updatedAt: new Date("2026-06-01T00:00:00Z"),
    ...overrides,
  };
}

test("includes National guidance and lists state-specific guidance first", () => {
  const records = [
    evidence("national", { jurisdictions: "National", year: 2026 }),
    evidence("nsw", { jurisdictions: "NSW", year: 2024 }),
    evidence("vic", { jurisdictions: "VIC" }),
  ];

  const result = filterEvidence(records, baseFilters);

  assert.deepEqual(
    result.map((record) => record.id),
    ["nsw", "national"],
  );
});

test("uses OR logic across selected jurisdictions", () => {
  const records = [
    evidence("nsw", { jurisdictions: "NSW" }),
    evidence("vic", { jurisdictions: "VIC" }),
    evidence("wa", { jurisdictions: "WA" }),
    evidence("national", { jurisdictions: "National" }),
  ];

  const result = filterEvidence(records, {
    ...baseFilters,
    jurisdictions: ["NSW", "VIC"],
  });

  assert.deepEqual(
    result.map((record) => record.id),
    ["nsw", "vic", "national"],
  );
});

test("ignores duplicate and blank selected jurisdictions", () => {
  const records = [
    evidence("nsw", { jurisdictions: "NSW" }),
    evidence("vic", { jurisdictions: "VIC" }),
    evidence("national", { jurisdictions: "National" }),
  ];

  const result = filterEvidence(records, {
    ...baseFilters,
    jurisdictions: [" ", "NSW", " nsw ", ""],
  });

  assert.deepEqual(
    result.map((record) => record.id),
    ["nsw", "national"],
  );
});

test("returns National records when National is selected directly", () => {
  const records = [
    evidence("national", { jurisdictions: "National" }),
    evidence("nsw", { jurisdictions: "NSW" }),
  ];

  const result = filterEvidence(records, {
    ...baseFilters,
    jurisdictions: ["National"],
  });

  assert.deepEqual(
    result.map((record) => record.id),
    ["national"],
  );
});

test("supports records that apply to multiple jurisdictions", () => {
  const records = [
    evidence("multi", { jurisdictions: "ACT, NSW" }),
    evidence("national", { jurisdictions: "National" }),
  ];

  const result = filterEvidence(records, baseFilters);

  assert.deepEqual(
    result.map((record) => record.id),
    ["multi", "national"],
  );
});

test("returns a multi-jurisdiction record only once when multiple selected jurisdictions match", () => {
  const records = [
    evidence("multi", { jurisdictions: "NSW, VIC" }),
    evidence("national", { jurisdictions: "National" }),
  ];

  const result = filterEvidence(records, {
    ...baseFilters,
    jurisdictions: ["NSW", "VIC"],
  });

  assert.deepEqual(
    result.map((record) => record.id),
    ["multi", "national"],
  );
});

test("applies context, sub-category, and engagement filters with AND logic", () => {
  const records = [
    evidence("match", { subCategory: "Suicide" }),
    evidence("wrong-context", {
      context: "General Public",
      subCategory: "Suicide",
    }),
    evidence("wrong-sub-category", { subCategory: "Carers" }),
    evidence("wrong-engagement", {
      subCategory: "Suicide",
      engagementLevel: "Inform",
    }),
  ];

  const result = filterEvidence(records, {
    ...baseFilters,
    subCategory: "Suicide",
  });

  assert.deepEqual(
    result.map((record) => record.id),
    ["match"],
  );
});

test("matches sub-category values after trimming whitespace and normalizing case", () => {
  const records = [
    evidence("normalized", { subCategory: " suicide " }),
    evidence("wrong-sub-category", { subCategory: "Carers" }),
  ];

  const result = filterEvidence(records, {
    ...baseFilters,
    subCategory: " SUICIDE ",
  });

  assert.deepEqual(
    result.map((record) => record.id),
    ["normalized"],
  );
});

test("does not require a record sub-category when the filter is omitted", () => {
  const records = [
    evidence("general"),
    evidence("specific", { subCategory: "Carers" }),
  ];

  const result = filterEvidence(records, baseFilters);

  assert.deepEqual(
    result.map((record) => record.id),
    ["general", "specific"],
  );
});

test("filters multiple research context selections independently", () => {
  const records = [
    evidence("mental-consult"),
    evidence("cancer-involve", {
      context: "Medical Conditions",
      subCategory: "Cancer",
      engagementLevel: "Involve",
    }),
    evidence("cancer-consult", {
      context: "Medical Conditions",
      subCategory: "Cancer",
      engagementLevel: "Consult",
    }),
  ];

  const result = filterEvidenceGroups(records, {
    jurisdictions: ["NSW"],
    selections: [
      {
        context: "Mental Health",
        subCategory: null,
        engagementLevel: "Consult",
      },
      {
        context: "Medical Conditions",
        subCategory: "Cancer",
        engagementLevel: "Involve",
      },
    ],
  });

  assert.deepEqual(
    result.map((group) => group.records.map((record) => record.id)),
    [["mental-consult"], ["cancer-involve"]],
  );
});

test("gets available sub-categories for the selected jurisdiction and context", () => {
  const records = [
    evidence("nsw-cancer", {
      jurisdictions: "NSW",
      context: "Medical Conditions",
      subCategory: "Cancer",
    }),
    evidence("national-allergies", {
      jurisdictions: "National",
      context: "Medical Conditions",
      subCategory: "Allergies",
    }),
    evidence("vic-asthma", {
      jurisdictions: "VIC",
      context: "Medical Conditions",
      subCategory: "Asthma",
    }),
    evidence("nsw-general", {
      jurisdictions: "NSW",
      context: "Medical Conditions",
      subCategory: null,
    }),
    evidence("wrong-context", {
      jurisdictions: "NSW",
      context: "Mental Health",
      subCategory: "Suicide",
    }),
  ];

  const result = getAvailableSubCategories(records, {
    jurisdictions: ["NSW"],
    context: "Medical Conditions",
  });

  assert.deepEqual(result, ["Allergies", "Cancer"]);
});

test("returns no sub-category options until required option filters are selected", () => {
  const records = [
    evidence("nsw-cancer", {
      jurisdictions: "NSW",
      context: "Medical Conditions",
      subCategory: "Cancer",
    }),
  ];

  assert.deepEqual(
    getAvailableSubCategories(records, {
      jurisdictions: [],
      context: "Medical Conditions",
    }),
    [],
  );
  assert.deepEqual(
    getAvailableSubCategories(records, {
      jurisdictions: ["NSW"],
      context: " ",
    }),
    [],
  );
});

test("matches normalized values without using partial matches", () => {
  const records = [
    evidence("normalized", {
      jurisdictions: " nsw ",
      context: "mental health",
      engagementLevel: "consult",
    }),
    evidence("partial", { context: "Mental Health Services" }),
  ];

  const result = filterEvidence(records, {
    ...baseFilters,
    jurisdictions: [" nSw "],
    context: " MENTAL HEALTH ",
    engagementLevel: " CONSULT ",
  });

  assert.deepEqual(
    result.map((record) => record.id),
    ["normalized"],
  );
});

test("supports all six grouped engagement levels", () => {
  const levels = [
    "Inform",
    "Consult",
    "Involve",
    "Collaborate",
    "Empower",
    "Extended roles",
  ];
  const records = levels.map((engagementLevel, index) =>
    evidence(String(index), { engagementLevel }),
  );

  for (const engagementLevel of levels) {
    const result = filterEvidence(records, {
      ...baseFilters,
      engagementLevel,
    });
    assert.deepEqual(
      result.map((record) => record.engagementLevel),
      [engagementLevel],
    );
  }
});

test("uses deterministic tie-breakers and places unknown years last", () => {
  const records = [
    evidence("z-id", { publisher: "Beta", title: "Guide", year: 2024 }),
    evidence("b-id", { publisher: "Alpha", title: "Zulu", year: 2024 }),
    evidence("a-id", { publisher: "Alpha", title: "Zulu", year: 2024 }),
    evidence("title", { publisher: "Alpha", title: "Alpha", year: 2024 }),
    evidence("newest", { publisher: "Zulu", year: 2026 }),
    evidence("unknown-zulu", { publisher: "Zulu", year: null }),
    evidence("unknown-alpha", { publisher: "Alpha", year: null }),
  ];

  const result = filterEvidence(records, baseFilters);

  assert.deepEqual(
    result.map((record) => record.id),
    [
      "newest",
      "title",
      "a-id",
      "b-id",
      "z-id",
      "unknown-alpha",
      "unknown-zulu",
    ],
  );
});

test("returns no results when a required filter is missing", () => {
  const record = evidence("match");

  assert.deepEqual(
    filterEvidence([record], { ...baseFilters, jurisdictions: [] }),
    [],
  );
  assert.deepEqual(
    filterEvidence([record], { ...baseFilters, context: " " }),
    [],
  );
  assert.deepEqual(
    filterEvidence([record], { ...baseFilters, engagementLevel: "" }),
    [],
  );
});

test("does not mutate the records array", () => {
  const records = [
    evidence("older", { year: 2020 }),
    evidence("newer", { year: 2026 }),
  ];
  const originalOrder = records.map((record) => record.id);

  filterEvidence(records, baseFilters);

  assert.deepEqual(
    records.map((record) => record.id),
    originalOrder,
  );
});

test("filters a large evidence set in under one second", () => {
  const records = Array.from({ length: 10_000 }, (_, index) =>
    evidence(String(index), {
      jurisdictions: index % 3 === 0 ? "National" : "NSW",
      year: 2000 + (index % 27),
    }),
  );

  const startedAt = performance.now();
  const result = filterEvidence(records, baseFilters);
  const elapsed = performance.now() - startedAt;

  assert.equal(result.length, records.length);
  assert.ok(elapsed < 1_000, `Expected < 1000ms, received ${elapsed}ms`);
});

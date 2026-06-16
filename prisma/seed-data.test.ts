import { describe, expect, it } from "vitest";
import seedData from "./seed-data.json";
import {
  EXPECTED_SEED_RECORD_COUNT,
  validateSeedData,
} from "./seed-data.validation";

describe("seed-data.json integrity (CAKE-2)", () => {
  it("contains the expected number of evidence records", () => {
    expect(seedData).toHaveLength(EXPECTED_SEED_RECORD_COUNT);
  });

  it("validates all required schema fields for every row", () => {
    const rows = validateSeedData(seedData);
    expect(rows).toHaveLength(EXPECTED_SEED_RECORD_COUNT);
  });

  it("uses supported jurisdiction codes", () => {
    const allowed = new Set([
      "National",
      "NSW",
      "VIC",
      "QLD",
      "WA",
      "SA",
      "TAS",
      "ACT",
      "NT",
    ]);

    for (const row of validateSeedData(seedData)) {
      for (const jurisdiction of row.jurisdictions.split(",")) {
        expect(allowed.has(jurisdiction.trim())).toBe(true);
      }
    }
  });

  it("keeps hourly rate ranges consistent when both values are present", () => {
    for (const row of validateSeedData(seedData)) {
      if (row.minHourlyRate != null && row.maxHourlyRate != null) {
        expect(row.minHourlyRate).toBeLessThanOrEqual(row.maxHourlyRate);
      }
    }
  });
});

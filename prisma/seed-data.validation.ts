export type EvidenceSeedRow = {
  publisher: string;
  title: string;
  year: number | null;
  link: string | null;
  jurisdictions: string;
  context: string;
  subCategory: string | null;
  engagementLevel: string;
  minHourlyRate: number | null;
  maxHourlyRate: number | null;
  reimbursementGuidance: boolean;
  unpaidEngagementGuidance: boolean;
  exampleOrganisations: string | null;
};

const REQUIRED_STRING_FIELDS: (keyof EvidenceSeedRow)[] = [
  "publisher",
  "title",
  "jurisdictions",
  "context",
  "engagementLevel",
];

export function validateSeedRow(row: unknown, index: number): EvidenceSeedRow {
  if (!row || typeof row !== "object") {
    throw new Error(`Seed row ${index}: expected an object`);
  }

  const record = row as Record<string, unknown>;

  for (const field of REQUIRED_STRING_FIELDS) {
    const value = record[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`Seed row ${index}: missing required field "${field}"`);
    }
  }

  const minRate = record.minHourlyRate;
  const maxRate = record.maxHourlyRate;

  if (minRate != null && typeof minRate !== "number") {
    throw new Error(`Seed row ${index}: minHourlyRate must be a number or null`);
  }

  if (maxRate != null && typeof maxRate !== "number") {
    throw new Error(`Seed row ${index}: maxHourlyRate must be a number or null`);
  }

  if (minRate != null && maxRate != null && minRate > maxRate) {
    throw new Error(`Seed row ${index}: minHourlyRate cannot exceed maxHourlyRate`);
  }

  return {
    publisher: (record.publisher as string).trim(),
    title: (record.title as string).trim(),
    year: typeof record.year === "number" ? record.year : null,
    link: typeof record.link === "string" ? record.link : null,
    jurisdictions: (record.jurisdictions as string).trim(),
    context: (record.context as string).trim(),
    subCategory: typeof record.subCategory === "string" ? record.subCategory.trim() : null,
    engagementLevel: (record.engagementLevel as string).trim(),
    minHourlyRate: minRate as number | null,
    maxHourlyRate: maxRate as number | null,
    reimbursementGuidance: Boolean(record.reimbursementGuidance),
    unpaidEngagementGuidance: Boolean(record.unpaidEngagementGuidance),
    exampleOrganisations:
      typeof record.exampleOrganisations === "string" ? record.exampleOrganisations.trim() : null,
  };
}

export function validateSeedData(rows: unknown[]): EvidenceSeedRow[] {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Seed data must be a non-empty array");
  }

  return rows.map((row, index) => validateSeedRow(row, index));
}

export const EXPECTED_SEED_RECORD_COUNT = 71;

import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";

export type QuizFilters = {
  jurisdictions: string[];
  context: string;
  subCategory: string | null;
  engagementLevel: string;
};

const NATIONAL = "national";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function recordJurisdictions(record: EvidenceRecordDTO): string[] {
  return record.jurisdictions
    .split(",")
    .map(normalize)
    .filter(Boolean);
}

function compareText(left: string, right: string): number {
  const normalizedLeft = normalize(left);
  const normalizedRight = normalize(right);

  if (normalizedLeft !== normalizedRight) {
    return normalizedLeft < normalizedRight ? -1 : 1;
  }

  if (left === right) {
    return 0;
  }
  return left < right ? -1 : 1;
}

/** CAKE-4 — client-side filter engine */
export function filterEvidence(
  records: EvidenceRecordDTO[],
  filters: QuizFilters,
): EvidenceRecordDTO[] {
  const selectedJurisdictions = new Set(
    filters.jurisdictions.map(normalize).filter(Boolean),
  );
  const context = normalize(filters.context);
  const subCategory = filters.subCategory
    ? normalize(filters.subCategory)
    : null;
  const engagementLevel = normalize(filters.engagementLevel);

  if (selectedJurisdictions.size === 0 || !context || !engagementLevel) {
    return [];
  }

  const matches = records.filter((record) => {
    const jurisdictions = recordJurisdictions(record);
    const matchesJurisdiction = jurisdictions.some(
      (jurisdiction) =>
        jurisdiction === NATIONAL || selectedJurisdictions.has(jurisdiction),
    );

    return (
      matchesJurisdiction &&
      normalize(record.context) === context &&
      (subCategory === null ||
        (record.subCategory !== null &&
          normalize(record.subCategory) === subCategory)) &&
      normalize(record.engagementLevel) === engagementLevel
    );
  });

  return matches.sort((left, right) => {
    const leftIsStateSpecific = recordJurisdictions(left).some(
      (jurisdiction) =>
        jurisdiction !== NATIONAL && selectedJurisdictions.has(jurisdiction),
    );
    const rightIsStateSpecific = recordJurisdictions(right).some(
      (jurisdiction) =>
        jurisdiction !== NATIONAL && selectedJurisdictions.has(jurisdiction),
    );

    if (leftIsStateSpecific !== rightIsStateSpecific) {
      return leftIsStateSpecific ? -1 : 1;
    }

    const leftYear = left.year ?? Number.NEGATIVE_INFINITY;
    const rightYear = right.year ?? Number.NEGATIVE_INFINITY;
    if (leftYear !== rightYear) {
      return leftYear > rightYear ? -1 : 1;
    }

    return (
      compareText(left.publisher, right.publisher) ||
      compareText(left.title, right.title) ||
      compareText(left.id, right.id)
    );
  });
}

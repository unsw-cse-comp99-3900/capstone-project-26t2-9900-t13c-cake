import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";

export type QuizFilters = {
  jurisdictions: string[];
  context: string;
  subCategory: string | null;
  engagementLevel: string;
};

/** CAKE-4 — client-side filter engine */
export function filterEvidence(
  _records: EvidenceRecordDTO[],
  _filters: QuizFilters,
): EvidenceRecordDTO[] {
  return [];
}

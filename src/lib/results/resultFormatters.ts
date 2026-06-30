import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import type { QuizFilters } from "@/lib/filter/filterService";

export const RESULTS_DISCLAIMER =
  "This tool provides indicative guidance only. Rates and policies may change. Always confirm with the publishing organisation before budgeting.";

export const TOOL_TITLE = "Consumer Rep Remuneration Tool";

export function formatRateRange(record: EvidenceRecordDTO): string {
  if (record.minHourlyRate === null && record.maxHourlyRate === null) {
    return "Not specified";
  }

  if (record.minHourlyRate === record.maxHourlyRate) {
    return `$${record.minHourlyRate}/hr`;
  }

  return `$${record.minHourlyRate ?? "?"}-$${record.maxHourlyRate ?? "?"}/hr`;
}

export function formatBooleanGuidance(value: boolean): string {
  return value ? "Included" : "Not included";
}

export function formatResultSummary(count: number): string {
  const resultWord = count === 1 ? "result" : "results";
  const matchWord = count === 1 ? "matches" : "match";

  return `${count} ${resultWord} best ${matchWord} your selections`;
}

export function formatFilterSummary(filters: QuizFilters): string {
  const subCategory = filters.subCategory ?? "No sub-category";

  return `${filters.jurisdictions.join(", ")} / ${filters.context} / ${subCategory} / ${filters.engagementLevel}`;
}

export function buildResultsPdfFilename(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `remuneration-results-${stamp}.pdf`;
}

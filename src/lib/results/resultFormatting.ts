import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";

/** Maximum evidence rows selectable for side-by-side comparison (CAKE-5). */
export const MAX_COMPARISON_RECORDS = 4;

/** Format an hourly rate range for comparison and card views. */
export function formatRateRange(record: EvidenceRecordDTO): string {
  if (record.minHourlyRate === null && record.maxHourlyRate === null) {
    return "Not specified";
  }

  if (record.minHourlyRate === record.maxHourlyRate) {
    return `$${record.minHourlyRate}/hr`;
  }

  return `$${record.minHourlyRate ?? "?"}-$${record.maxHourlyRate ?? "?"}/hr`;
}

export function formatBoolean(value: boolean): string {
  return value ? "Included" : "Not included";
}

/** Toggle a record in the comparison selection, capped at maxRecords. */
export function toggleComparisonSelection(
  selectedIds: string[],
  recordId: string,
  maxRecords = MAX_COMPARISON_RECORDS,
): string[] {
  if (selectedIds.includes(recordId)) {
    return selectedIds.filter((id) => id !== recordId);
  }

  if (selectedIds.length >= maxRecords) {
    return selectedIds;
  }

  return [...selectedIds, recordId];
}

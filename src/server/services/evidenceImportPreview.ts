import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import type {
  ExcelEvidenceRow,
  ImportPreviewRow,
  ImportPreviewSummary,
} from "@/server/services/excelParseService";
import { validationService } from "@/server/services/validationService";

/** Classify Excel rows as create / update / invalid for CAKE-12 import. */
export function buildEvidenceImportPreview(
  rows: ExcelEvidenceRow[],
  activeRecords: Pick<EvidenceRecordDTO, "id">[],
): ImportPreviewSummary {
  const activeIds = new Set(activeRecords.map((record) => record.id));
  const previewRows: ImportPreviewRow[] = rows.map((row, index) => {
    const errors = validationService.validateExcelEvidenceRow(row);
    const id = row.id.trim();

    if (id !== "" && !activeIds.has(id)) {
      errors.push(`No active EvidenceRecord found for id "${id}"`);
    }

    const action = errors.length > 0 ? "invalid" : id === "" ? "create" : "update";

    return {
      rowNumber: index + 2,
      action,
      data: row,
      errors,
    };
  });

  return {
    totalRows: previewRows.length,
    createCount: previewRows.filter((row) => row.action === "create").length,
    updateCount: previewRows.filter((row) => row.action === "update").length,
    invalidCount: previewRows.filter((row) => row.action === "invalid").length,
    rows: previewRows,
  };
}

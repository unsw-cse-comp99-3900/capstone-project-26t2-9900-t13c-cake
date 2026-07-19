import type { EvidenceRecord } from "@prisma/client";
import * as XLSX from "xlsx";

export const EVIDENCE_EXCEL_COLUMNS = [
  "id",
  "publisher",
  "title",
  "year",
  "link",
  "jurisdictions",
  "context",
  "subCategory",
  "engagementLevel",
  "minHourlyRate",
  "maxHourlyRate",
  "reimbursementGuidance",
  "unpaidEngagementGuidance",
  "exampleOrganisations",
] as const;

export type EvidenceExcelColumn = (typeof EVIDENCE_EXCEL_COLUMNS)[number];
export type ExcelEvidenceRow = Pick<EvidenceRecord, EvidenceExcelColumn>;
export type ImportAction = "create" | "update" | "invalid";

export type ImportPreviewRow = {
  rowNumber: number;
  action: ImportAction;
  data: ExcelEvidenceRow;
  errors: string[];
};

export type ImportPreviewSummary = {
  totalRows: number;
  createCount: number;
  updateCount: number;
  invalidCount: number;
  rows: ImportPreviewRow[];
};

export type ExcelHeaderValidationDetails = {
  expected: readonly EvidenceExcelColumn[];
  actual: string[];
  missing: string[];
  extra: string[];
  mismatched: Array<{
    columnNumber: number;
    expected: EvidenceExcelColumn;
    actual: string | null;
  }>;
};

export class ExcelParseError extends Error {
  constructor(
    message: string,
    public readonly details?: ExcelHeaderValidationDetails,
  ) {
    super(message);
    this.name = "ExcelParseError";
  }
}

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

function parseOptionalString(value: unknown): string | null {
  if (isBlank(value)) {
    return null;
  }
  return String(value).trim();
}

function parseId(value: unknown): string {
  return parseOptionalString(value) ?? "";
}

function parseOptionalNumber(value: unknown): number | null {
  if (isBlank(value)) {
    return null;
  }

  const numberValue = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(numberValue) ? numberValue : Number.NaN;
}

function parseOptionalInteger(value: unknown): number | null {
  const numberValue = parseOptionalNumber(value);
  if (numberValue === null || Number.isNaN(numberValue)) {
    return numberValue;
  }
  return Number.isInteger(numberValue) ? numberValue : Number.NaN;
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value === 1;
  }
  if (typeof value === "string") {
    const normalised = value.trim().toLowerCase();
    return ["true", "yes", "y", "1", "on"].includes(normalised);
  }
  return false;
}

function validateHeaders(actual: string[]): void {
  const expected = EVIDENCE_EXCEL_COLUMNS;
  const missing = expected.filter((column) => !actual.includes(column));
  const extra = actual.filter((column) => !expected.includes(column as EvidenceExcelColumn));
  const mismatched = expected
    .map((column, index) => ({
      columnNumber: index + 1,
      expected: column,
      actual: actual[index] ?? null,
    }))
    .filter(({ expected: column, actual: actualColumn }) => actualColumn !== column);

  if (missing.length > 0 || extra.length > 0 || mismatched.length > 0) {
    throw new ExcelParseError("Excel headers do not match the expected Evidence columns", {
      expected,
      actual,
      missing,
      extra,
      mismatched,
    });
  }
}

function mapWorksheetRow(row: Record<EvidenceExcelColumn, unknown>): ExcelEvidenceRow {
  return {
    id: parseId(row.id),
    publisher: parseOptionalString(row.publisher) ?? "",
    title: parseOptionalString(row.title) ?? "",
    year: parseOptionalInteger(row.year),
    link: parseOptionalString(row.link),
    jurisdictions: parseOptionalString(row.jurisdictions) ?? "",
    context: parseOptionalString(row.context) ?? "",
    subCategory: parseOptionalString(row.subCategory),
    engagementLevel: parseOptionalString(row.engagementLevel) ?? "",
    minHourlyRate: parseOptionalNumber(row.minHourlyRate),
    maxHourlyRate: parseOptionalNumber(row.maxHourlyRate),
    reimbursementGuidance: parseBoolean(row.reimbursementGuidance),
    unpaidEngagementGuidance: parseBoolean(row.unpaidEngagementGuidance),
    exampleOrganisations: parseOptionalString(row.exampleOrganisations),
  };
}

/** Layer 3 — ExcelParseService (CAKE-12) */
export const excelParseService = {
  createEvidenceWorkbook(rows: ExcelEvidenceRow[] = []): ArrayBuffer {
    const worksheetRows = rows.map((row) =>
      Object.fromEntries(EVIDENCE_EXCEL_COLUMNS.map((column) => [column, row[column]])),
    );
    const worksheet = XLSX.utils.json_to_sheet(worksheetRows, {
      header: [...EVIDENCE_EXCEL_COLUMNS],
      skipHeader: false,
    });
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Evidence");
    const output = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" }) as Uint8Array;
    return Uint8Array.from(output).buffer;
  },

  parseWorkbook(buffer: ArrayBuffer): ExcelEvidenceRow[] {
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstWorksheetName = workbook.SheetNames[0];

    if (!firstWorksheetName) {
      throw new ExcelParseError("Excel workbook does not contain any worksheets");
    }

    const worksheet = workbook.Sheets[firstWorksheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      blankrows: false,
      defval: "",
    });
    const headerRow = rows[0]?.map((value) => String(value).trim()) ?? [];

    validateHeaders(headerRow);

    const dataRows = rows.slice(1);
    return dataRows.map((values) => {
      const row = Object.fromEntries(
        EVIDENCE_EXCEL_COLUMNS.map((column, index) => [column, values[index] ?? ""]),
      ) as Record<EvidenceExcelColumn, unknown>;
      return mapWorksheetRow(row);
    });
  },
};

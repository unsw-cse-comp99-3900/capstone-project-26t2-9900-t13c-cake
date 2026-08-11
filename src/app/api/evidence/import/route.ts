import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { EvidenceImportConflictError } from "@/server/repositories/evidenceRepository";
import { evidenceService } from "@/server/services/evidenceService";
import {
  ExcelParseError,
  excelParseService,
} from "@/server/services/excelParseService";
import { buildEvidenceImportPreview } from "@/server/services/evidenceImportPreview";

function isExcelFile(value: FormDataEntryValue): value is File {
  return (
    typeof File !== "undefined" &&
    value instanceof File &&
    value.name.toLowerCase().endsWith(".xlsx")
  );
}

function findUploadedExcelFile(formData: FormData): File | null {
  const files = Array.from(formData.values()).filter(isExcelFile);
  return files.length === 1 ? files[0] : null;
}

function getApplyMode(request: Request, formData: FormData): boolean {
  const { searchParams } = new URL(request.url);
  return searchParams.get("apply") === "true" || formData.get("mode") === "apply";
}

/** ImportExportController — POST /api/evidence/import (CAKE-12) */
export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const formData = await request.formData();
    const file = findUploadedExcelFile(formData);

    if (!file) {
      return NextResponse.json(
        { error: "Upload exactly one .xlsx file using multipart/form-data" },
        { status: 400 },
      );
    }

    const applyMode = getApplyMode(request, formData);
    const workbookBuffer = await file.arrayBuffer();
    const rows = excelParseService.parseWorkbook(workbookBuffer);
    const activeRecords = await evidenceService.listAllActiveEvidence();
    const summary = buildEvidenceImportPreview(rows, activeRecords);

    if (!applyMode) {
      return NextResponse.json(summary);
    }

    if (summary.invalidCount > 0) {
      return NextResponse.json(
        {
          error: "Import was not applied because one or more rows are invalid.",
          invalidRows: summary.rows.filter((row) => row.action === "invalid"),
          summary,
        },
        { status: 400 },
      );
    }

    const result = await evidenceService.applyExcelImport(rows);

    return NextResponse.json({
      totalRows: summary.totalRows,
      createdCount: result.createdCount,
      updatedCount: result.updatedCount,
      invalidCount: 0,
    });
  } catch (error) {
    if (error instanceof ExcelParseError) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
        },
        { status: 400 },
      );
    }

    if (error instanceof EvidenceImportConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error("[POST /api/evidence/import]", error);
    return NextResponse.json({ error: "Unable to import evidence records" }, { status: 500 });
  }
}

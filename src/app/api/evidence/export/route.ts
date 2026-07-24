import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { evidenceService } from "@/server/services/evidenceService";
import { excelParseService } from "@/server/services/excelParseService";

const XLSX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function workbookResponse(workbook: ArrayBuffer, filename: string): Response {
  return new Response(workbook, {
    headers: {
      "Content-Type": XLSX_CONTENT_TYPE,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

/** ImportExportController — GET /api/evidence/export (CAKE-12) */
export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const isTemplate = searchParams.get("template") === "true";

    if (isTemplate) {
      const workbook = excelParseService.createEvidenceWorkbook([]);
      return workbookResponse(workbook, "evidence-template.xlsx");
    }

    const records = await evidenceService.listAllActiveEvidence();
    const workbook = excelParseService.createEvidenceWorkbook(records);
    return workbookResponse(workbook, "evidence-records.xlsx");
  } catch (error) {
    console.error("[GET /api/evidence/export]", error);
    return NextResponse.json({ error: "Unable to export evidence records" }, { status: 500 });
  }
}

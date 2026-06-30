import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import type { QuizFilters } from "@/lib/filter/filterService";
import {
  RESULTS_DISCLAIMER,
  TOOL_TITLE,
  buildResultsPdfFilename,
  formatBooleanGuidance,
  formatFilterSummary,
  formatRateRange,
  formatResultSummary,
} from "./resultFormatters";

type ExportResultsPdfInput = {
  filters: QuizFilters;
  records: EvidenceRecordDTO[];
  generatedAt?: Date;
};

const PAGE_MARGIN = 48;
const LINE_HEIGHT = 14;
const TITLE_SIZE = 16;
const BODY_SIZE = 11;
const SMALL_SIZE = 9;

function addLines(
  doc: import("jspdf").jsPDF,
  lines: string[],
  x: number,
  y: number,
  maxWidth: number,
  pageHeight: number,
): number {
  let currentY = y;

  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line, maxWidth) as string[];

    for (const wrappedLine of wrapped) {
      if (currentY > pageHeight - PAGE_MARGIN) {
        doc.addPage();
        currentY = PAGE_MARGIN;
      }

      doc.text(wrappedLine, x, currentY);
      currentY += LINE_HEIGHT;
    }
  }

  return currentY;
}

function buildRecordLines(record: EvidenceRecordDTO): string[] {
  const lines = [
    record.publisher,
    record.title,
    [record.year ? `Year: ${record.year}` : null, `Jurisdictions: ${record.jurisdictions}`]
      .filter(Boolean)
      .join(" · "),
    `Rate: ${formatRateRange(record)}`,
    `Reimbursement guidance: ${formatBooleanGuidance(record.reimbursementGuidance)}`,
    `Unpaid consumer engagement guidance: ${formatBooleanGuidance(record.unpaidEngagementGuidance)}`,
  ];

  if (record.exampleOrganisations) {
    lines.push(`Example organisations: ${record.exampleOrganisations}`);
  }

  if (record.link) {
    lines.push(`Source: ${record.link}`);
  }

  return lines;
}

/** CAKE-14 — build and download a PDF summary of quiz results */
export async function exportResultsPdf({
  filters,
  records,
  generatedAt = new Date(),
}: ExportResultsPdfInput): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;

  let y = PAGE_MARGIN;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(TITLE_SIZE);
  doc.text(TOOL_TITLE, PAGE_MARGIN, y);
  y += LINE_HEIGHT + 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(BODY_SIZE);
  y = addLines(
    doc,
    [
      "Results summary",
      `Generated: ${generatedAt.toLocaleString()}`,
      formatResultSummary(records.length),
      formatFilterSummary(filters),
    ],
    PAGE_MARGIN,
    y,
    contentWidth,
    pageHeight,
  );

  y += LINE_HEIGHT / 2;

  if (records.length === 0) {
    doc.setFont("helvetica", "bold");
    y = addLines(
      doc,
      ["No exact matches found"],
      PAGE_MARGIN,
      y,
      contentWidth,
      pageHeight,
    );
    doc.setFont("helvetica", "normal");
    y = addLines(
      doc,
      [
        "Try broadening the jurisdiction, removing the sub-category, or selecting a more general engagement context.",
      ],
      PAGE_MARGIN,
      y,
      contentWidth,
      pageHeight,
    );
  } else {
    records.forEach((record, index) => {
      const recordLines = buildRecordLines(record);

      if (index > 0) {
        y += LINE_HEIGHT / 2;
      }

      if (y > pageHeight - PAGE_MARGIN - LINE_HEIGHT * 4) {
        doc.addPage();
        y = PAGE_MARGIN;
      }

      doc.setFont("helvetica", "bold");
      y = addLines(doc, recordLines.slice(0, 2), PAGE_MARGIN, y, contentWidth, pageHeight);
      doc.setFont("helvetica", "normal");
      y = addLines(doc, recordLines.slice(2), PAGE_MARGIN, y, contentWidth, pageHeight);
    });
  }

  y += LINE_HEIGHT;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(SMALL_SIZE);
  addLines(doc, [`Important: ${RESULTS_DISCLAIMER}`], PAGE_MARGIN, y, contentWidth, pageHeight);

  doc.save(buildResultsPdfFilename(generatedAt));
}

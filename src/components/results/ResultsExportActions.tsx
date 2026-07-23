"use client";

import { useState, type ReactNode } from "react";
import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import type { MultiQuizFilters, QuizFilters } from "@/lib/filter/filterService";
import { exportResultsPdf } from "@/lib/results/exportResultsPdf";
import { printResults } from "@/lib/results/printResults";
import { useLanguage } from "@/contexts/LanguageContext";

type ResultsExportActionsProps = {
  filters: QuizFilters | MultiQuizFilters;
  records: EvidenceRecordDTO[];
  disabled?: boolean;
  trailingActions?: ReactNode;
};

const actionButtonClassName =
  "min-h-10 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-60";

/** CAKE-14 — print and PDF export controls for the results panel */
export function ResultsExportActions({
  filters,
  records,
  disabled = false,
  trailingActions,
}: ResultsExportActionsProps) {
  const { t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const actionsDisabled = disabled || isExporting;

  async function handleExportPdf() {
    setExportError(null);
    setIsExporting(true);

    try {
      await exportResultsPdf({ filters, records });
    } catch {
      setExportError(t("exportError"));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={printResults}
          disabled={actionsDisabled}
          className={actionButtonClassName}
        >
          {t("printResults")}
        </button>
        <button
          type="button"
          onClick={() => void handleExportPdf()}
          disabled={actionsDisabled}
          className={actionButtonClassName}
        >
          {isExporting ? t("exportingPdf") : t("exportPdf")}
        </button>
        {trailingActions}
      </div>
      {exportError ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {exportError}
        </p>
      ) : null}
    </div>
  );
}

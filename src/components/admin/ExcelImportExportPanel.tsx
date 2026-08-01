"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

type ImportPreviewSummary = {
  totalRows: number;
  createCount: number;
  updateCount: number;
  invalidCount: number;
  rows: Array<{
    rowNumber: number;
    action: "create" | "update" | "invalid";
    errors: string[];
  }>;
};

type ImportApplySummary = {
  totalRows: number;
  createdCount: number;
  updatedCount: number;
  invalidCount: number;
};

type ImportErrorResponse = {
  error?: string;
  invalidRows?: ImportPreviewSummary["rows"];
};

type ExcelImportExportPanelProps = {
  variant?: "panel" | "buttons";
  onImportApplied?: () => void | Promise<void>;
};

function download(url: string): void {
  window.location.href = url;
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T;
  if (!response.ok) {
    const errorData = data as ImportErrorResponse;
    throw new Error(errorData.error ?? "Request failed");
  }
  return data;
}

function previewMessage(summary: ImportPreviewSummary): string {
  const invalidRows = summary.rows.filter((row) => row.action === "invalid");
  const invalidDetails =
    invalidRows.length > 0
      ? `\n\nInvalid rows:\n${invalidRows
          .slice(0, 8)
          .map((row) => `Row ${row.rowNumber}: ${row.errors.join("; ")}`)
          .join("\n")}${invalidRows.length > 8 ? "\n..." : ""}`
      : "";

  return [
    `Preview complete.`,
    `Total rows: ${summary.totalRows}`,
    `Create: ${summary.createCount}`,
    `Update: ${summary.updateCount}`,
    `Invalid: ${summary.invalidCount}`,
    invalidDetails,
    summary.invalidCount === 0 ? "\nApply this import now?" : "\nFix invalid rows before applying.",
  ].join("\n");
}

/** CAKE-12 — ExcelImportExportPanel (embedded in CRUD workspace) */
export function ExcelImportExportPanel({
  variant = "panel",
  onImportApplied,
}: ExcelImportExportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadForPreview(file: File): Promise<ImportPreviewSummary> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/evidence/import", {
      method: "POST",
      body: formData,
    });

    return readJsonResponse<ImportPreviewSummary>(response);
  }

  async function uploadForApply(file: File): Promise<ImportApplySummary> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/evidence/import?apply=true", {
      method: "POST",
      body: formData,
    });

    return readJsonResponse<ImportApplySummary>(response);
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsImporting(true);
    setMessage("");

    try {
      const preview = await uploadForPreview(file);
      const shouldApply = preview.invalidCount === 0 && window.confirm(previewMessage(preview));

      if (!shouldApply) {
        setMessage(
          preview.invalidCount > 0
            ? "Import preview found invalid rows. No data was changed."
            : "Import preview completed. No data was changed.",
        );
        return;
      }

      const applied = await uploadForApply(file);
      setMessage(
        `Import applied: ${applied.createdCount} created, ${applied.updatedCount} updated.`,
      );
      await onImportApplied?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to import Excel file";
      setMessage(errorMessage);
    } finally {
      setIsImporting(false);
    }
  }

  const controls = (
    <div className="flex flex-wrap gap-3" aria-busy={isImporting}>
      <button
        type="button"
        onClick={() => download("/api/evidence/export?template=true")}
        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        Download template
      </button>
      <button
        type="button"
        onClick={() => download("/api/evidence/export")}
        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        Export data
      </button>
      <button
        type="button"
        disabled={isImporting}
        aria-describedby="excel-import-help"
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0b3b4a] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0a3340] disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isImporting ? "Importing..." : "Import Excel"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        aria-label="Choose an Excel workbook to import"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={handleFileSelected}
      />
      <span id="excel-import-help" className="sr-only">
        Select an XLSX workbook. You can review a preview before any records are changed.
      </span>
    </div>
  );

  if (variant === "buttons") {
    return (
      <div className="self-start space-y-2">
        {controls}
        {message && (
          <p role="status" aria-live="polite" className="max-w-xl text-sm font-medium text-slate-800">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-base font-bold text-slate-900">Bulk data tools</h4>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            Download a blank template, export the current records, or choose a completed XLSX
            workbook to import. You will see a preview before any data changes.
          </p>
          {message && (
            <p role="status" aria-live="polite" className="mt-2 text-sm font-medium text-slate-800">
              {message}
            </p>
          )}
        </div>
        {controls}
      </div>
    </div>
  );
}

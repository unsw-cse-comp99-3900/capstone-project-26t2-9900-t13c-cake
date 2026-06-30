/** CAKE-12 — ExcelImportExportPanel (embedded in CRUD workspace) */
export function ExcelImportExportPanel() {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
      <p className="text-base leading-7 text-slate-600">
        Excel import and export controls will be added here as part of <strong>CAKE-12</strong>,
        within the evidence records workspace.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled
          className="inline-flex min-h-10 cursor-not-allowed items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-400"
        >
          Import Excel
        </button>
        <button
          type="button"
          disabled
          className="inline-flex min-h-10 cursor-not-allowed items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-400"
        >
          Export Excel
        </button>
      </div>
    </div>
  );
}

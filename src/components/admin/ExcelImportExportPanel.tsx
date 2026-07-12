/** CAKE-12 — ExcelImportExportPanel (embedded in CRUD workspace) */
export function ExcelImportExportPanel({ variant = "panel" }: { variant?: "panel" | "buttons" }) {
  const controls = (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        disabled
        className="inline-flex min-h-10 cursor-not-allowed items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-400"
      >
        Import excel
      </button>
      <button
        type="button"
        disabled
        className="inline-flex min-h-10 cursor-not-allowed items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-400"
      >
        Export data
      </button>
    </div>
  );

  if (variant === "buttons") {
    return controls;
  }

  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-base font-bold text-slate-900">Bulk data tools</h4>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Reserved for CAKE-12 Excel import and data export workflows.
          </p>
        </div>
        {controls}
      </div>
    </div>
  );
}

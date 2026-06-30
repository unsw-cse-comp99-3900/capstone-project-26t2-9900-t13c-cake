import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import type { QuizFilters } from "@/lib/filter/filterService";
import { formatFilterSummary, formatResultSummary, TOOL_TITLE } from "@/lib/results/resultFormatters";
import { PRINT_AREA_ID } from "@/lib/results/printResults";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { ResultCard } from "./ResultCard";
import { ResultsExportActions } from "./ResultsExportActions";

type ResultsPanelProps = {
  filters: QuizFilters;
  records: EvidenceRecordDTO[];
  error: string | null;
  onRetry: () => void;
  onStartOver: () => void;
};

/** CAKE-5 / CAKE-14 — ResultsPanel */
export function ResultsPanel({ filters, records, error, onRetry, onStartOver }: ResultsPanelProps) {
  const hasExportableResults = !error;

  return (
    <section
      id={PRINT_AREA_ID}
      className="results-print-area rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6"
    >
      <div className="print-only mb-4 border-b border-slate-300 pb-3">
        <p className="text-lg font-bold text-slate-950">{TOOL_TITLE}</p>
        <p className="mt-1 text-sm text-slate-600">Results summary</p>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {error ? "Unable to load results" : formatResultSummary(records.length)}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{formatFilterSummary(filters)}</p>
      </div>

      <div className="no-print mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <ResultsExportActions filters={filters} records={records} disabled={!hasExportableResults} />
        <button
          type="button"
          onClick={onStartOver}
          className="min-h-10 rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          Start over
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="no-print mt-4 min-h-10 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            Try again
          </button>
        </div>
      ) : records.length === 0 ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-xl font-bold text-slate-950">No exact matches found</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Try broadening the jurisdiction, removing the sub-category, or selecting a more general
            engagement context.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {records.map((record) => (
            <ResultCard key={record.id} record={record} />
          ))}
        </div>
      )}

      <div className="mt-4">
        <DisclaimerBanner />
      </div>
    </section>
  );
}

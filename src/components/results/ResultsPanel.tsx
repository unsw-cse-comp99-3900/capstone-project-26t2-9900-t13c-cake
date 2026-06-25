import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import type { QuizFilters } from "@/lib/filter/filterService";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { ResultCard } from "./ResultCard";

type ResultsPanelProps = {
  filters: QuizFilters;
  records: EvidenceRecordDTO[];
  error: string | null;
  onRetry: () => void;
  onStartOver: () => void;
};

function formatResultSummary(count: number): string {
  const resultWord = count === 1 ? "result" : "results";
  const matchWord = count === 1 ? "matches" : "match";

  return `${count} ${resultWord} best ${matchWord} your selections`;
}

const plannedActions = ["Print results", "Export PDF", "Compare side by side"] as const;

/** CAKE-5 - ResultsPanel */
export function ResultsPanel({ filters, records, error, onRetry, onStartOver }: ResultsPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {error ? "Unable to load results" : formatResultSummary(records.length)}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {filters.jurisdictions.join(", ")} / {filters.context} /{" "}
            {filters.subCategory ?? "No sub-category"} / {filters.engagementLevel}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {plannedActions.map((action) => (
            <button
              key={action}
              type="button"
              disabled
              className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 opacity-70"
            >
              {action}
            </button>
          ))}
        </div>
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
            className="mt-4 min-h-10 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-700"
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

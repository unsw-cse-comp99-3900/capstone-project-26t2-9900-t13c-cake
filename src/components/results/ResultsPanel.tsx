import type {
  FilteredEvidenceGroup,
  MultiQuizFilters,
} from "@/lib/filter/filterService";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { ResultCard } from "./ResultCard";

type ResultsPanelProps = {
  filters: MultiQuizFilters;
  records: FilteredEvidenceGroup[];
  error: string | null;
  onRetry: () => void;
  onStartOver: () => void;
};

function formatResultSummary(count: number, groupCount: number): string {
  const resultWord = count === 1 ? "result" : "results";
  const matchWord = count === 1 ? "matches" : "match";

  return `${count} ${resultWord} best ${matchWord} your ${groupCount} selection${groupCount === 1 ? "" : "s"}`;
}

const plannedActions = ["Print results", "Export PDF", "Compare side by side"] as const;

/** CAKE-5 - ResultsPanel */
export function ResultsPanel({ filters, records, error, onRetry, onStartOver }: ResultsPanelProps) {
  const totalRecords = records.reduce((total, group) => total + group.records.length, 0);

  return (
    <section
      aria-labelledby="results-heading"
      aria-live="polite"
      aria-busy={false}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6"
    >
      <div>
        <div>
          <h2 id="results-heading" tabIndex={-1} autoFocus className="text-2xl font-bold tracking-tight text-slate-950 outline-none sm:text-3xl">
            {error
              ? "Unable to load results"
              : formatResultSummary(totalRecords, records.length)}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {filters.jurisdictions.join(", ")} / {filters.selections.length} research
            context selection{filters.selections.length === 1 ? "" : "s"}
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
        <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 min-h-10 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-5">
          {totalRecords === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-xl font-bold text-slate-950">No exact matches found</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Try broadening the jurisdiction, removing a sub-category, or selecting a more
                general engagement context.
              </p>
            </div>
          ) : null}

          {records.map((group) => (
            <section
              key={`${group.selection.context}-${group.selection.subCategory ?? "none"}-${group.selection.engagementLevel}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {group.selection.context}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {group.selection.subCategory ?? "No sub-category"} /{" "}
                  {group.selection.engagementLevel} / {group.records.length}{" "}
                  result{group.records.length === 1 ? "" : "s"}
                </p>
              </div>

              {group.records.length === 0 ? (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
                  No exact matches are currently available for this selected
                  combination.
                </div>
              ) : (
                <div className="mt-3 grid gap-3">
                  {group.records.map((record) => (
                    <ResultCard key={record.id} record={record} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <div className="mt-4">
        <DisclaimerBanner />
      </div>
    </section>
  );
}

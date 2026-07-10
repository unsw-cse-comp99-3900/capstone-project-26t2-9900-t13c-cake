import { useMemo, useState } from "react";
import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import type { QuizFilters } from "@/lib/filter/filterService";
import {
  MAX_COMPARISON_RECORDS,
  toggleComparisonSelection,
} from "@/lib/results/resultFormatting";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { ResultCard } from "./ResultCard";
import { ResultsComparisonView } from "./ResultsComparisonView";

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

const plannedActions = ["Print results", "Export PDF"] as const;

/** CAKE-5 - ResultsPanel */
export function ResultsPanel({ filters, records, error, onRetry, onStartOver }: ResultsPanelProps) {
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const selectedRecords = useMemo(() => {
    const selectedIds = new Set(selectedRecordIds);
    return records.filter((record) => selectedIds.has(record.id));
  }, [records, selectedRecordIds]);

  const canCompare = selectedRecordIds.length >= 2;
  const reachedComparisonLimit = selectedRecordIds.length >= MAX_COMPARISON_RECORDS;

  function handleToggleComparison(recordId: string) {
    setSelectedRecordIds((previous) => toggleComparisonSelection(previous, recordId));
  }

  function handleClearSelection() {
    setSelectedRecordIds([]);
    setIsComparing(false);
  }

  function handleStartOverClick() {
    handleClearSelection();
    onStartOver();
  }

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
          <button
            type="button"
            disabled={!canCompare || Boolean(error)}
            onClick={() => setIsComparing(true)}
            className="min-h-10 rounded-lg border border-teal-700 px-4 py-2 text-sm font-bold text-teal-800 transition hover:bg-teal-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-500 disabled:opacity-70 disabled:hover:bg-transparent"
          >
            Compare side by side
          </button>
        </div>
        <button
          type="button"
          onClick={handleStartOverClick}
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
      ) : isComparing ? (
        <ResultsComparisonView
          records={selectedRecords}
          onBack={() => setIsComparing(false)}
          onClearSelection={handleClearSelection}
        />
      ) : (
        <>
          <div className="mt-3 text-sm leading-6 text-slate-600" aria-live="polite">
            {selectedRecordIds.length === 0
              ? `Select 2-${MAX_COMPARISON_RECORDS} results to compare side by side.`
              : `${selectedRecordIds.length} of ${MAX_COMPARISON_RECORDS} results selected for comparison.`}
          </div>
          <div className="mt-4 grid gap-3">
            {records.map((record) => (
              <ResultCard
                key={record.id}
                record={record}
                isSelectedForComparison={selectedRecordIds.includes(record.id)}
                isComparisonDisabled={
                  reachedComparisonLimit && !selectedRecordIds.includes(record.id)
                }
                onToggleComparison={handleToggleComparison}
              />
            ))}
          </div>
        </>
      )}

      <div className="mt-4">
        <DisclaimerBanner />
      </div>
    </section>
  );
}

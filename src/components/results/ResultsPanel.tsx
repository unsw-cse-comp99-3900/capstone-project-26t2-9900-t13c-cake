import { useMemo, useState } from "react";
import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import type {
  FilteredEvidenceGroup,
  MultiQuizFilters,
} from "@/lib/filter/filterService";
import {
  MAX_COMPARISON_RECORDS,
  toggleComparisonSelection,
} from "@/lib/results/resultFormatting";
import { TOOL_TITLE } from "@/lib/results/resultFormatters";
import { PRINT_AREA_ID } from "@/lib/results/printResults";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { ResultCard } from "./ResultCard";
import { ResultsComparisonView } from "./ResultsComparisonView";
import { ResultsExportActions } from "./ResultsExportActions";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateOption } from "@/i18n/optionTranslations";

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

function flattenUniqueRecords(groups: FilteredEvidenceGroup[]): EvidenceRecordDTO[] {
  const seen = new Set<string>();
  const unique: EvidenceRecordDTO[] = [];

  for (const group of groups) {
    for (const record of group.records) {
      if (seen.has(record.id)) {
        continue;
      }
      seen.add(record.id);
      unique.push(record);
    }
  }

  return unique;
}

/** CAKE-5 / CAKE-14 - ResultsPanel with grouped filters, print/export, and comparison */
export function ResultsPanel({ filters, records, error, onRetry, onStartOver }: ResultsPanelProps) {
  const { language, t } = useLanguage();
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const flatRecords = useMemo(() => flattenUniqueRecords(records), [records]);
  const totalRecords = flatRecords.length;
  const hasExportableResults = !error;

  const availableRecordIds = useMemo(
    () => new Set(flatRecords.map((record) => record.id)),
    [flatRecords],
  );

  const selectedRecords = useMemo(() => {
    const selectedIds = new Set(selectedRecordIds);
    return flatRecords.filter((record) => selectedIds.has(record.id));
  }, [flatRecords, selectedRecordIds]);

  const selectedRecordCount = selectedRecords.length;
  const canCompare = selectedRecordCount >= 2;
  const reachedComparisonLimit = selectedRecordCount >= MAX_COMPARISON_RECORDS;

  function handleToggleComparison(recordId: string) {
    setIsComparing(false);
    setSelectedRecordIds((previous) =>
      toggleComparisonSelection(
        previous.filter((selectedId) => availableRecordIds.has(selectedId)),
        recordId,
      ),
    );
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
    <section
      id={PRINT_AREA_ID}
      aria-labelledby="results-heading"
      className="results-print-area rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6"
    >
      <div className="print-only mb-4 border-b border-slate-300 pb-3">
        <p className="text-lg font-bold text-slate-950">{TOOL_TITLE}</p>
        <p className="mt-1 text-sm text-slate-600">Results summary</p>
      </div>

      <div>
        <h2
          id="results-heading"
          tabIndex={-1}
          autoFocus
          aria-live="polite"
          className="text-2xl font-bold tracking-tight text-slate-950 outline-none sm:text-3xl"
        >
          {error
            ? t("unableResults")
            : language !== "en"
              ? t("resultSummary", { count: totalRecords, groups: records.length })
              : formatResultSummary(totalRecords, records.length)}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          {t("researchSelections", {
            jurisdictions: filters.jurisdictions.join(", "),
            count: filters.selections.length,
          })}
        </p>
      </div>

      <div className="no-print mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <ResultsExportActions
          disabled={!hasExportableResults}
          trailingActions={
            <button
              type="button"
              disabled={!canCompare || Boolean(error)}
              onClick={() => setIsComparing(true)}
              className="min-h-10 rounded-lg border border-teal-700 px-4 py-2 text-sm font-bold text-teal-800 transition hover:bg-teal-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-500 disabled:opacity-70 disabled:hover:bg-transparent"
            >
              {t("compare")}
            </button>
          }
        />
        <button
          type="button"
          onClick={handleStartOverClick}
          className="min-h-10 rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          {t("startOver")}
        </button>
      </div>

      {error ? (
        <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="no-print mt-4 min-h-10 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            {t("tryAgain")}
          </button>
        </div>
      ) : isComparing && canCompare ? (
        <ResultsComparisonView
          records={selectedRecords}
          onBack={() => setIsComparing(false)}
          onClearSelection={handleClearSelection}
        />
      ) : (
        <div className="mt-4 space-y-5">
          {totalRecords === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-xl font-bold text-slate-950">{t("noMatches")}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {t("broadenSearch")}
              </p>
            </div>
          ) : (
            <div className="no-print text-sm leading-6 text-slate-600" aria-live="polite">
              {selectedRecordCount === 0
                ? t("selectionHint", { max: MAX_COMPARISON_RECORDS })
                : t("selectedForComparison", {
                    count: selectedRecordCount,
                    max: MAX_COMPARISON_RECORDS,
                  })}
            </div>
          )}

          {records.map((group) => (
            <section
              key={`${group.selection.context}-${group.selection.subCategory ?? "none"}-${group.selection.engagementLevel}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {translateOption(language, group.selection.context)}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {group.selection.subCategory
                    ? translateOption(language, group.selection.subCategory)
                    : t("noSubCategory")} /{" "}
                  {t("groupResults", {
                    context: translateOption(language, group.selection.context),
                    engagement: translateOption(language, group.selection.engagementLevel),
                    count: group.records.length,
                  })}
                </p>
              </div>

              {group.records.length === 0 ? (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
                  {t("noCombination")}
                </div>
              ) : (
                <div className="mt-3 grid gap-3">
                  {group.records.map((record) => (
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
              )}
            </section>
          ))}
        </div>
      )}

      <div className="results-disclaimer-print mt-4">
        <DisclaimerBanner />
      </div>
    </section>
  );
}

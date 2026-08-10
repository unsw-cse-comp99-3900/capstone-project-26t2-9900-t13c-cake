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
import { JURISDICTIONS } from "@/lib/constants/quizOptions";
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

function formatJurisdictions(values: string[], language: ReturnType<typeof useLanguage>["language"]): string {
  const labels = new Map<string, string>(
    JURISDICTIONS.map((jurisdiction) => [
      jurisdiction.value,
      translateOption(language, jurisdiction.label),
    ]),
  );

  return values.map((value) => labels.get(value) ?? value).join(", ");
}

function formatCoverageCount(value: string, language: ReturnType<typeof useLanguage>["language"]): string {
  const count = Number(value);

  if (!Number.isFinite(count)) {
    return translateOption(language, value);
  }

  return `${count} ${count === 1 ? "category" : "categories"}`;
}

function formatGroupResultCount(count: number): string {
  return `${count} ${count === 1 ? "result" : "results"}`;
}

/** CAKE-5 / CAKE-14 — ResultsPanel with grouped filters, print/export, and comparison */
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
  const jurisdictionSummary = formatJurisdictions(filters.jurisdictions, language);

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
      className="results-print-area py-2"
    >
      <div className="print-only mb-4 border-b border-slate-300 pb-3">
        <p className="text-lg font-bold text-slate-950">{TOOL_TITLE}</p>
        <p className="mt-1 text-sm text-slate-600">{t("resultsSummaryLabel")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(240px,0.34fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
        <div className="lg:sticky lg:top-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#006b63]">
            {t("resultsKicker")}
          </p>
          <h2
            id="results-heading"
            tabIndex={-1}
            autoFocus
            aria-live="polite"
            className="mt-3 max-w-3xl font-[Georgia,serif] text-4xl font-normal leading-tight tracking-tight text-[#051b1a] outline-none sm:text-5xl lg:max-w-[330px]"
          >
            {error ? t("unableResults") : t("matchedEvidenceGuidance")}
          </h2>
          <div className="mt-6 h-0.5 w-14 bg-[#006b63]" />
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 lg:max-w-[310px]">
            {error
              ? t("resultsLookupError")
              : language !== "en"
                ? t("resultSummary", { count: totalRecords, groups: records.length })
                : formatResultSummary(totalRecords, records.length)}
          </p>

          <div className="no-print mt-8 rounded-[10px] border border-[#a9d3cc] bg-[#edf8f5] px-4 py-4 shadow-[0_14px_26px_rgba(0,79,72,0.06)]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#006b63]">
              {t("yourSelections")}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {jurisdictionSummary}
            </p>
            <p className="mt-2 text-sm font-semibold text-[#003f3b]">
              {t("researchContextSelectionCount", { count: filters.selections.length })}
            </p>
          </div>
        </div>

        <div
          data-pdf-surface
          className="rounded-[24px] border border-[#a9d3cc] bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] sm:p-7 lg:p-10"
        >
          <div className="no-print flex flex-col gap-4 border-b border-[#dce6e4] pb-6 xl:flex-row xl:items-center xl:justify-between">
            <ResultsExportActions
              disabled={!hasExportableResults}
              trailingActions={
                <button
                  type="button"
                  disabled={!canCompare || Boolean(error)}
                  onClick={() => setIsComparing(true)}
                  className="min-h-11 rounded-[4px] border border-[#006b63] px-4 py-2 text-sm font-bold text-[#003f3b] transition hover:bg-[#f3fbf8] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-500 disabled:opacity-70 disabled:hover:bg-transparent"
                >
                  {t("compare")}
                </button>
              }
            />
            <button
              type="button"
              onClick={handleStartOverClick}
              className="min-h-11 rounded-[4px] border border-[#006b63] bg-[#006b63] px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#00524c] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {t("startOver")}
            </button>
          </div>

          {error ? (
        <div role="alert" className="mt-6 rounded-[8px] border border-red-200 bg-red-50 p-4 text-red-950">
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="no-print mt-4 min-h-10 rounded-[4px] bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-700"
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
        <div className="mt-6 space-y-5">
          {totalRecords === 0 ? (
            <div className="rounded-[8px] border border-[#dce6e4] bg-[#f8faf9] p-5">
              <h3 className="text-2xl font-bold text-slate-950">{t("noMatches")}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {t("broadenSearch")}
              </p>
            </div>
          ) : (
            <div className="no-print rounded-[8px] border border-[#dce6e4] bg-[#f8faf9] px-4 py-3 text-sm leading-6 text-slate-600" aria-live="polite">
              {selectedRecordCount === 0
                ? t("selectionHint", { max: MAX_COMPARISON_RECORDS })
                : t("selectedForComparison", { count: selectedRecordCount, max: MAX_COMPARISON_RECORDS })}
            </div>
          )}

          {records.map((group) => (
            <section
              key={`${group.selection.context}-${group.selection.subCategory ?? "none"}-${group.selection.engagementLevel}`}
              className="rounded-[12px] border border-[#dce6e4] bg-[#f7fbfa] p-4 lg:p-5"
            >
              <div>
                <h3 className="text-2xl font-bold text-[#051b1a]">
                  {translateOption(language, group.selection.context)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {group.selection.subCategory
                    ? translateOption(language, group.selection.subCategory)
                    : t("noSubCategory")} /{" "}
                  {formatCoverageCount(group.selection.engagementLevel, language)} /{" "}
                  {formatGroupResultCount(group.records.length)}
                </p>
              </div>

              {group.records.length === 0 ? (
                <div className="mt-4 rounded-[8px] border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
                  {t("noCombination")}
                </div>
              ) : (
                <div className="mt-4 grid gap-4">
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

          <div className="results-disclaimer-print mt-5">
        <DisclaimerBanner />
          </div>

          <aside className="no-print mt-5 border border-[#a9d3cc] bg-[#edf8f5] px-5 py-5">
        <div className="grid gap-4 md:grid-cols-[0.45fr_1fr] md:items-center">
          <div>
            <h3 className="text-2xl font-bold text-[#051b1a]">{t("contactSupport")}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {t("resultsSupportHelp")}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-700 md:justify-end">
            <a
              href="mailto:deborah.johnston@unsw.edu.au"
              className="text-teal-800 underline underline-offset-4 transition hover:text-teal-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              deborah.johnston@unsw.edu.au
            </a>
            <a
              href="/feedback"
              className="text-teal-800 underline underline-offset-4 transition hover:text-teal-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {t("anonymousFeedback")}
            </a>
          </div>
        </div>
      </aside>
        </div>
      </div>
    </section>
  );
}

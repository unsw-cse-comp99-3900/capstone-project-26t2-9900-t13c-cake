import { useState } from "react";
import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import { formatBoolean, formatRateRange } from "@/lib/results/resultFormatting";
import type { EvidenceTranslation } from "@/lib/api/translationApiClient";
import { useLanguage } from "@/contexts/LanguageContext";

type ResultCardProps = {
  record: EvidenceRecordDTO;
  isSelectedForComparison?: boolean;
  isComparisonDisabled?: boolean;
  onToggleComparison?: (recordId: string) => void;
  translation?: EvidenceTranslation;
};

/** CAKE-5 - ResultCard */
export function ResultCard({
  record,
  isSelectedForComparison = false,
  isComparisonDisabled = false,
  onToggleComparison,
  translation,
}: ResultCardProps) {
  const { language, t } = useLanguage();
  const [showOriginal, setShowOriginal] = useState(false);
  const useTranslation = language === "zh-CN" && translation && !showOriginal;
  const display = useTranslation ? translation : record;
  const comparisonInputId = `compare-${record.id}`;

  return (
    <article
      className={[
        "result-card-print rounded-xl border bg-white p-4 shadow-sm transition",
        isSelectedForComparison ? "border-teal-600 ring-2 ring-teal-100" : "border-slate-200",
      ].join(" ")}
    >
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <p className="text-sm font-bold text-teal-800">{display.publisher}</p>
          <h3 className="mt-1 text-lg font-bold leading-6 text-slate-950">{display.title}</h3>
          {language === "zh-CN" && translation ? (
            <div className="no-print mt-2 flex items-center gap-3 text-xs">
              <span className="rounded-full bg-violet-50 px-2 py-1 font-semibold text-violet-800">
                {t("aiTranslation")}
              </span>
              <button type="button" className="font-semibold text-teal-800 underline" onClick={() => setShowOriginal((value) => !value)}>
                {showOriginal ? t("showTranslation") : t("showOriginal")}
              </button>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap justify-start gap-2 text-sm font-semibold text-slate-700 sm:w-48 sm:justify-end">
          {record.year ? (
            <span className="rounded-full bg-slate-100 px-3 py-1">{record.year}</span>
          ) : null}
          <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-800">
            {record.jurisdictions}
          </span>
        </div>
      </div>

      {onToggleComparison ? (
        <label
          htmlFor={comparisonInputId}
          className={[
            "no-print mt-4 flex min-h-10 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm font-semibold transition",
            isSelectedForComparison
              ? "border-teal-600 bg-teal-50 text-teal-900"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-300",
            isComparisonDisabled && !isSelectedForComparison
              ? "cursor-not-allowed opacity-50 hover:border-slate-200"
              : "",
          ].join(" ")}
        >
          <input
            id={comparisonInputId}
            type="checkbox"
            checked={isSelectedForComparison}
            disabled={isComparisonDisabled && !isSelectedForComparison}
            onChange={() => onToggleComparison(record.id)}
            className="size-5 rounded border-slate-300 text-teal-700 accent-teal-700"
          />
          <span>{isSelectedForComparison ? t("selectedCompare") : t("selectCompare")}</span>
        </label>
      ) : null}

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-700">{t("rate")}</dt>
          <dd className="mt-1 text-base font-bold text-slate-950">
            {record.minHourlyRate === null && record.maxHourlyRate === null
              ? t("notSpecified")
              : formatRateRange(record)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-700">
            {t("reimbursement")}
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-800">
            {language === "zh-CN" ? t(record.reimbursementGuidance ? "included" : "notIncluded") : formatBoolean(record.reimbursementGuidance)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-700">
            {t("unpaid")}
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-800">
            {language === "zh-CN" ? t(record.unpaidEngagementGuidance ? "included" : "notIncluded") : formatBoolean(record.unpaidEngagementGuidance)}
          </dd>
        </div>
      </dl>

      {display.exampleOrganisations || record.link ? (
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
          {display.exampleOrganisations ? (
            <p className="text-sm leading-6 text-slate-600">
              {t("exampleOrganisations")}: {display.exampleOrganisations}
            </p>
          ) : (
            <span />
          )}
          {record.link ? (
            <a
              href={record.link}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open source for ${record.title} in a new tab`}
              className="result-card-link inline-flex min-h-9 items-center justify-center rounded-lg border border-teal-700 px-3 py-1.5 text-sm font-bold text-teal-800 transition hover:bg-teal-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {t("openSource")}
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

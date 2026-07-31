import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import { formatBoolean, formatRateRange } from "@/lib/results/resultFormatting";
import { useLanguage } from "@/contexts/LanguageContext";

type ResultCardProps = {
  record: EvidenceRecordDTO;
  isSelectedForComparison?: boolean;
  isComparisonDisabled?: boolean;
  onToggleComparison?: (recordId: string) => void;
};

/** CAKE-5 - ResultCard */
export function ResultCard({
  record,
  isSelectedForComparison = false,
  isComparisonDisabled = false,
  onToggleComparison,
}: ResultCardProps) {
  const { language, t } = useLanguage();
  const comparisonInputId = `compare-${record.id}`;

  return (
    <article
      className={[
        "result-card-print rounded-[8px] border bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition",
        isSelectedForComparison
          ? "border-[#006b63] bg-[#f4fbf9] ring-1 ring-[#006b63]"
          : "border-[#dce6e4] hover:border-[#b8d9d4]",
      ].join(" ")}
    >
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#006b63]">
            {record.publisher}
          </p>
          <h3 className="mt-2 text-xl font-bold leading-7 text-[#050817]">
            {record.title}
          </h3>
        </div>
        <div className="flex shrink-0 flex-wrap justify-start gap-2 text-sm font-semibold text-slate-700 sm:w-48 sm:justify-end">
          {record.year ? (
            <span className="rounded-full bg-[#f0f4f4] px-3 py-1">{record.year}</span>
          ) : null}
          <span className="rounded-full bg-[#e8f7f3] px-3 py-1 text-[#006b63]">
            {record.jurisdictions}
          </span>
        </div>
      </div>

      {onToggleComparison ? (
        <label
          htmlFor={comparisonInputId}
          className={[
            "no-print mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-[4px] border px-3 py-2 text-sm font-semibold transition",
            isSelectedForComparison
              ? "border-[#006b63] bg-[#e8f7f3] text-[#003f3b]"
              : "border-[#dce6e4] bg-[#f8faf9] text-slate-700 hover:border-[#b8d9d4]",
            isComparisonDisabled && !isSelectedForComparison
              ? "cursor-not-allowed opacity-50 hover:border-[#dce6e4]"
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

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[6px] bg-[#f8faf9] px-4 py-3">
          <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{t("rate")}</dt>
          <dd className="mt-1 text-base font-bold text-slate-950">
            {record.minHourlyRate === null && record.maxHourlyRate === null
              ? t("notSpecified")
              : formatRateRange(record)}
          </dd>
        </div>
        <div className="rounded-[6px] bg-[#f8faf9] px-4 py-3">
          <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            {t("reimbursement")}
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-800">
            {language !== "en" ? t(record.reimbursementGuidance ? "included" : "notIncluded") : formatBoolean(record.reimbursementGuidance)}
          </dd>
        </div>
        <div className="rounded-[6px] bg-[#f8faf9] px-4 py-3">
          <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            {t("unpaid")}
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-800">
            {language !== "en" ? t(record.unpaidEngagementGuidance ? "included" : "notIncluded") : formatBoolean(record.unpaidEngagementGuidance)}
          </dd>
        </div>
      </dl>

      {record.exampleOrganisations || record.link ? (
        <div className="mt-5 flex flex-col gap-3 border-t border-[#dce6e4] pt-4 sm:flex-row sm:items-center sm:justify-between">
          {record.exampleOrganisations ? (
            <p className="text-sm leading-6 text-slate-600">
              {t("exampleOrganisations")}: {record.exampleOrganisations}
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
              className="result-card-link inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[#006b63] px-4 py-1.5 text-sm font-bold text-[#003f3b] transition hover:bg-[#f3fbf8] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {t("openSource")}
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

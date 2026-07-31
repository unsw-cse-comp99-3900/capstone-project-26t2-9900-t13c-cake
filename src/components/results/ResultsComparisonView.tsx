import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import { formatRateRange } from "@/lib/results/resultFormatting";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateOption } from "@/i18n/optionTranslations";
import type { TranslationKey } from "@/i18n/translations";

type ResultsComparisonViewProps = {
  records: EvidenceRecordDTO[];
  onBack: () => void;
  onClearSelection: () => void;
};

type ComparisonRow = {
  label: TranslationKey;
  render: (record: EvidenceRecordDTO) => React.ReactNode;
};

/** Sprint 2 — Multiple Results Comparison View */
export function ResultsComparisonView({
  records,
  onBack,
  onClearSelection,
}: ResultsComparisonViewProps) {
  const { language, t } = useLanguage();
  const comparisonRows: ComparisonRow[] = [
    { label: "publisher", render: (record) => record.publisher },
    { label: "title", render: (record) => record.title },
    { label: "year", render: (record) => record.year ?? t("notSpecified") },
    { label: "jurisdiction", render: (record) => record.jurisdictions },
    { label: "context", render: (record) => translateOption(language, record.context) },
    {
      label: "subCategoryAdmin",
      render: (record) =>
        record.subCategory ? translateOption(language, record.subCategory) : t("noSubCategory"),
    },
    {
      label: "engagementLevelAdmin",
      render: (record) => translateOption(language, record.engagementLevel),
    },
    { label: "rate", render: formatRateRange },
    {
      label: "reimbursement",
      render: (record) => t(record.reimbursementGuidance ? "included" : "notIncluded"),
    },
    {
      label: "unpaid",
      render: (record) => t(record.unpaidEngagementGuidance ? "included" : "notIncluded"),
    },
    {
      label: "exampleOrganisations",
      render: (record) => record.exampleOrganisations ?? t("notSpecified"),
    },
    {
      label: "source",
      render: (record) =>
        record.link ? (
          <a
            href={record.link}
            target="_blank"
            rel="noreferrer"
            className="result-source-link font-bold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {t("openSource")}
          </a>
        ) : (
          t("notAvailable")
        ),
    },
  ];

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-3xl font-bold text-[#051b1a]">
            {t("compareSelectedResults")}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {t("compareSelectedResultsHelp", { count: records.length })}
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClearSelection}
            className="min-h-11 rounded-[4px] border border-[#9fbab7] px-4 py-2 text-sm font-semibold text-[#003f3b] transition hover:border-[#006b63] hover:bg-[#f3fbf8] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {t("clearSelection")}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="min-h-11 rounded-[4px] border border-[#006b63] bg-[#006b63] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#00524c] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {t("backToResults")}
          </button>
        </div>
      </div>

      <div className="results-comparison-print mt-5 overflow-x-auto rounded-[8px] border border-[#dce6e4]">
        <table className="min-w-full divide-y divide-[#dce6e4] text-left text-sm">
          <thead className="bg-[#f7fbfa]">
            <tr>
              <th scope="col" className="w-44 px-4 py-3 font-bold text-slate-700">
                {t("field")}
              </th>
              {records.map((record, index) => (
                <th
                  key={record.id}
                  scope="col"
                  className="min-w-56 px-4 py-3 font-bold text-slate-950"
                >
                  {t("resultNumber", { number: index + 1 })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dce6e4] bg-white">
            {comparisonRows.map((row) => (
              <tr key={row.label} className="align-top">
                <th scope="row" className="bg-[#f7fbfa] px-4 py-3 font-bold text-slate-700">
                  {t(row.label)}
                </th>
                {records.map((record) => (
                  <td key={record.id} className="px-4 py-3 leading-6 text-slate-800">
                    {row.render(record)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

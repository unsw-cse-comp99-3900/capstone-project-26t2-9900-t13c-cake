import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import { formatBoolean, formatRateRange } from "@/lib/results/resultFormatting";

type ResultsComparisonViewProps = {
  records: EvidenceRecordDTO[];
  onBack: () => void;
  onClearSelection: () => void;
};

type ComparisonRow = {
  label: string;
  render: (record: EvidenceRecordDTO) => React.ReactNode;
};

const comparisonRows: ComparisonRow[] = [
  { label: "Publisher", render: (record) => record.publisher },
  { label: "Title", render: (record) => record.title },
  { label: "Year", render: (record) => record.year ?? "Not specified" },
  { label: "Jurisdiction", render: (record) => record.jurisdictions },
  { label: "Context", render: (record) => record.context },
  { label: "Sub-category", render: (record) => record.subCategory ?? "No sub-category" },
  { label: "Engagement level", render: (record) => record.engagementLevel },
  { label: "Rate", render: formatRateRange },
  {
    label: "Reimbursement guidance",
    render: (record) => formatBoolean(record.reimbursementGuidance),
  },
  {
    label: "Unpaid engagement guidance",
    render: (record) => formatBoolean(record.unpaidEngagementGuidance),
  },
  {
    label: "Example organisations",
    render: (record) => record.exampleOrganisations ?? "Not specified",
  },
  {
    label: "Source",
    render: (record) =>
      record.link ? (
        <a
          href={record.link}
          target="_blank"
          rel="noreferrer"
          className="result-source-link font-bold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          Open source
        </a>
      ) : (
        "Not available"
      ),
  },
];

/** Sprint 2 — Multiple Results Comparison View */
export function ResultsComparisonView({
  records,
  onBack,
  onClearSelection,
}: ResultsComparisonViewProps) {
  return (
    <div className="mt-4">
      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-950">Compare selected results</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Review key remuneration fields across {records.length} selected sources.
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClearSelection}
            className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Clear selection
          </button>
          <button
            type="button"
            onClick={onBack}
            className="min-h-10 rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Back to results
          </button>
        </div>
      </div>

      <div className="results-comparison-print mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="w-44 px-4 py-3 font-bold text-slate-700">
                Field
              </th>
              {records.map((record, index) => (
                <th
                  key={record.id}
                  scope="col"
                  className="min-w-56 px-4 py-3 font-bold text-slate-950"
                >
                  Result {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {comparisonRows.map((row) => (
              <tr key={row.label} className="align-top">
                <th scope="row" className="bg-slate-50 px-4 py-3 font-bold text-slate-700">
                  {row.label}
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

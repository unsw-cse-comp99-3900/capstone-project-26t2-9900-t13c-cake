import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import { formatBooleanGuidance, formatRateRange } from "@/lib/results/resultFormatters";

type ResultCardProps = {
  record: EvidenceRecordDTO;
};

/** CAKE-5 - ResultCard */
export function ResultCard({ record }: ResultCardProps) {
  return (
    <article className="result-card-print rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <p className="text-sm font-bold text-teal-800">{record.publisher}</p>
          <h3 className="mt-1 text-lg font-bold leading-6 text-slate-950">{record.title}</h3>
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

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Rate</dt>
          <dd className="mt-1 text-base font-bold text-slate-950">{formatRateRange(record)}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Reimbursement guidance
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-800">
            {formatBooleanGuidance(record.reimbursementGuidance)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Unpaid consumer engagement guidance
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-800">
            {formatBooleanGuidance(record.unpaidEngagementGuidance)}
          </dd>
        </div>
      </dl>

      {record.exampleOrganisations || record.link ? (
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
          {record.exampleOrganisations ? (
            <p className="text-sm leading-6 text-slate-600">
              Example organisations: {record.exampleOrganisations}
            </p>
          ) : (
            <span />
          )}
          {record.link ? (
            <a
              href={record.link}
              target="_blank"
              rel="noreferrer"
              className="result-card-link inline-flex min-h-9 items-center justify-center rounded-lg border border-teal-700 px-3 py-1.5 text-sm font-bold text-teal-800 transition hover:bg-teal-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Open source
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { ExcelImportExportPanel } from "@/components/admin/ExcelImportExportPanel";
import {
  RecordFormPage,
  type AdminEvidenceRecord,
  type EvidenceFormValues,
} from "@/components/admin/RecordFormPage";

type SortOption = "updated_desc" | "year_desc" | "publisher_asc" | "title_asc" | "rate_desc";

const emptyForm: EvidenceFormValues = {
  publisher: "",
  title: "",
  year: null,
  link: "",
  jurisdictions: "National",
  context: "",
  subCategory: "",
  engagementLevel: "",
  minHourlyRate: null,
  maxHourlyRate: null,
  reimbursementGuidance: false,
  unpaidEngagementGuidance: false,
  exampleOrganisations: "",
};

function toFormValues(record: AdminEvidenceRecord): EvidenceFormValues {
  return {
    publisher: record.publisher,
    title: record.title,
    year: record.year,
    link: record.link ?? "",
    jurisdictions: record.jurisdictions,
    context: record.context,
    subCategory: record.subCategory ?? "",
    engagementLevel: record.engagementLevel,
    minHourlyRate: record.minHourlyRate,
    maxHourlyRate: record.maxHourlyRate,
    reimbursementGuidance: record.reimbursementGuidance,
    unpaidEngagementGuidance: record.unpaidEngagementGuidance,
    exampleOrganisations: record.exampleOrganisations ?? "",
  };
}

function formatRate(record: AdminEvidenceRecord): string {
  if (record.minHourlyRate === null && record.maxHourlyRate === null) {
    return "Not specified";
  }
  if (record.minHourlyRate === record.maxHourlyRate) {
    return `$${record.minHourlyRate}/hr`;
  }
  return `$${record.minHourlyRate ?? "?"}-${record.maxHourlyRate ?? "?"}/hr`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, "en-AU", { sensitivity: "base" });
}

function compareNumericText(left: string, right: string): number {
  return left.localeCompare(right, "en-AU", {
    numeric: true,
    sensitivity: "base",
  });
}

function maxRate(record: AdminEvidenceRecord): number {
  return record.maxHourlyRate ?? record.minHourlyRate ?? Number.NEGATIVE_INFINITY;
}

function recordJurisdictions(record: AdminEvidenceRecord): string[] {
  return record.jurisdictions
    .split(",")
    .map((jurisdiction) => jurisdiction.trim())
    .filter(Boolean);
}

/** CAKE-11 - RecordListPage */
export function RecordListPage() {
  const [records, setRecords] = useState<AdminEvidenceRecord[]>([]);
  const [query, setQuery] = useState("");
  const [jurisdictionFilter, setJurisdictionFilter] = useState("");
  const [contextFilter, setContextFilter] = useState("");
  const [engagementFilter, setEngagementFilter] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("updated_desc");
  const [selectedRecord, setSelectedRecord] = useState<AdminEvidenceRecord | null>(null);
  const [formValue, setFormValue] = useState<EvidenceFormValues>(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function loadRecords() {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await fetch("/api/evidence", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load evidence records");
      }
      const data = (await response.json()) as AdminEvidenceRecord[];
      setRecords(data);
    } catch {
      setLoadError("Unable to load evidence records. Please refresh and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRecords();
  }, []);

  const filterOptions = useMemo(() => {
    const jurisdictions = new Set<string>();
    const contexts = new Set<string>();
    const engagementLevels = new Set<string>();

    records.forEach((record) => {
      recordJurisdictions(record).forEach((jurisdiction) => jurisdictions.add(jurisdiction));
      if (record.context.trim()) {
        contexts.add(record.context.trim());
      }
      if (record.engagementLevel.trim()) {
        engagementLevels.add(record.engagementLevel.trim());
      }
    });

    return {
      jurisdictions: Array.from(jurisdictions).sort(compareText),
      contexts: Array.from(contexts).sort(compareText),
      engagementLevels: Array.from(engagementLevels).sort(compareNumericText),
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const normalisedQuery = query.trim().toLowerCase();
    const normalisedJurisdiction = jurisdictionFilter.trim().toLowerCase();
    const normalisedContext = contextFilter.trim().toLowerCase();
    const normalisedEngagement = engagementFilter.trim().toLowerCase();

    const filtered = records.filter((record) => {
      const matchesQuery =
        !normalisedQuery ||
        [record.publisher, record.title]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalisedQuery));

      const matchesJurisdiction =
        !normalisedJurisdiction ||
        recordJurisdictions(record).some(
          (jurisdiction) => jurisdiction.toLowerCase() === normalisedJurisdiction,
        );

      const matchesContext =
        !normalisedContext || record.context.trim().toLowerCase() === normalisedContext;

      const matchesEngagement =
        !normalisedEngagement ||
        record.engagementLevel.trim().toLowerCase() === normalisedEngagement;

      return matchesQuery && matchesJurisdiction && matchesContext && matchesEngagement;
    });

    return filtered.sort((left, right) => {
      if (sortOption === "year_desc") {
        return (right.year ?? Number.NEGATIVE_INFINITY) - (left.year ?? Number.NEGATIVE_INFINITY);
      }
      if (sortOption === "publisher_asc") {
        return compareText(left.publisher, right.publisher) || compareText(left.title, right.title);
      }
      if (sortOption === "title_asc") {
        return compareText(left.title, right.title) || compareText(left.publisher, right.publisher);
      }
      if (sortOption === "rate_desc") {
        return maxRate(right) - maxRate(left) || compareText(left.publisher, right.publisher);
      }
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });
  }, [contextFilter, engagementFilter, jurisdictionFilter, query, records, sortOption]);

  function clearFilters() {
    setQuery("");
    setJurisdictionFilter("");
    setContextFilter("");
    setEngagementFilter("");
    setSortOption("updated_desc");
  }

  function startCreate() {
    setSelectedRecord(null);
    setFormValue(emptyForm);
    setFormError("");
    setStatusMessage("");
    setIsFormOpen(true);
  }

  function startEdit(record: AdminEvidenceRecord) {
    setSelectedRecord(record);
    setFormValue(toFormValues(record));
    setFormError("");
    setStatusMessage("");
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isSubmitting) {
      return;
    }
    setIsFormOpen(false);
    setSelectedRecord(null);
    setFormValue(emptyForm);
    setFormError("");
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setFormError("");
    setStatusMessage("");

    const endpoint = selectedRecord ? `/api/evidence/${selectedRecord.id}` : "/api/evidence";
    const method = selectedRecord ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValue),
      });
      const data = (await response.json()) as AdminEvidenceRecord | { error?: string };

      if (!response.ok) {
        setFormError("error" in data && data.error ? data.error : "Unable to save record");
        return;
      }

      const savedRecord = data as AdminEvidenceRecord;
      setRecords((currentRecords) => {
        if (!selectedRecord) {
          return [savedRecord, ...currentRecords];
        }
        return currentRecords.map((record) => (record.id === savedRecord.id ? savedRecord : record));
      });
      setStatusMessage(selectedRecord ? "Record updated." : "Record created.");
      setIsFormOpen(false);
      setSelectedRecord(null);
      setFormValue(emptyForm);
    } catch {
      setFormError("Unable to save record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(record: AdminEvidenceRecord) {
    const confirmed = window.confirm(`Soft-delete "${record.title}"?`);
    if (!confirmed) {
      return;
    }

    setStatusMessage("");
    setFormError("");

    try {
      const response = await fetch(`/api/evidence/${record.id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Unable to delete record");
      }

      setRecords((currentRecords) => currentRecords.filter((item) => item.id !== record.id));
      if (selectedRecord?.id === record.id) {
        closeForm();
      }
      setStatusMessage("Record soft-deleted.");
    } catch {
      setLoadError("Unable to delete record. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Active records" value={records.length.toString()} />
        <Metric
          label="Visible after search"
          value={isLoading ? "..." : filteredRecords.length.toString()}
        />
        <Metric
          label="Last updated"
          value={records[0]?.updatedAt ? formatDate(records[0].updatedAt) : "No records"}
        />
      </div>

      {statusMessage && (
        <p role="status" className="rounded-lg bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900">
          {statusMessage}
        </p>
      )}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Evidence table</h3>
              </div>
              <div className="flex flex-wrap items-start gap-3">
                <ExcelImportExportPanel variant="buttons" onImportApplied={loadRecords} />
                <button
                  type="button"
                  onClick={startCreate}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0b3b4a] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0a3340]"
                >
                  Add record
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))_auto]">
              <label htmlFor="record-search" className="block text-sm font-semibold text-slate-800">
                Search records
                <input
                  id="record-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Publisher or title..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-normal text-slate-900 outline-none ring-teal-500 focus:border-teal-500 focus:ring-2"
                />
              </label>

              <SelectInput
                id="jurisdiction-filter"
                label="Jurisdiction"
                value={jurisdictionFilter}
                onChange={setJurisdictionFilter}
                options={filterOptions.jurisdictions}
                emptyLabel="All"
              />
              <SelectInput
                id="context-filter"
                label="Context"
                value={contextFilter}
                onChange={setContextFilter}
                options={filterOptions.contexts}
                emptyLabel="All"
              />
              <SelectInput
                id="engagement-filter"
                label="Engagement"
                value={engagementFilter}
                onChange={setEngagementFilter}
                options={filterOptions.engagementLevels}
                emptyLabel="All"
              />
              <label htmlFor="record-sort" className="block text-sm font-semibold text-slate-800">
                Sort by
                <select
                  id="record-sort"
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value as SortOption)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900 outline-none ring-teal-500 focus:border-teal-500 focus:ring-2"
                >
                  <option value="updated_desc">Updated newest</option>
                  <option value="year_desc">Year newest</option>
                  <option value="publisher_asc">Publisher A-Z</option>
                  <option value="title_asc">Title A-Z</option>
                  <option value="rate_desc">Rate highest</option>
                </select>
              </label>
              <div className="flex items-end lg:items-start lg:pt-6">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-[42px] w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 lg:w-auto"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {loadError && (
            <p role="alert" className="m-5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
              {loadError}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Record
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Scope
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Rate
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-600">
                      Loading evidence records...
                    </td>
                  </tr>
                )}

                {!isLoading && filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-600">
                      No records match this search.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="max-w-sm px-4 py-4 align-top">
                        <p className="font-bold text-slate-900">{record.title}</p>
                        <p className="mt-1 text-slate-600">
                          {record.publisher}
                          {record.year ? `, ${record.year}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top text-slate-700">
                        <p className="font-semibold text-slate-900">{record.jurisdictions}</p>
                        <p className="mt-1">{record.context}</p>
                        <p className="mt-1 text-slate-500">{record.engagementLevel}</p>
                      </td>
                      <td className="px-4 py-4 align-top text-slate-700">{formatRate(record)}</td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(record)}
                            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(record)}
                            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
      </section>

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 sm:py-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="record-form-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 id="record-form-title" className="text-xl font-bold text-slate-900">
                  {selectedRecord ? "Edit record" : "Add record"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                aria-label="Close record form"
                className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-xl font-bold leading-none text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                &times;
              </button>
            </div>

            <RecordFormPage
              mode={selectedRecord ? "edit" : "create"}
              value={formValue}
              isSubmitting={isSubmitting}
              error={formError}
              onChange={setFormValue}
              onCancel={closeForm}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function SelectInput({
  id,
  label,
  value,
  onChange,
  options,
  emptyLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  emptyLabel: string;
}) {
  return (
    <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
      {label}
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900 outline-none ring-teal-500 focus:border-teal-500 focus:ring-2"
      >
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

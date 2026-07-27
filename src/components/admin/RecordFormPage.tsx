"use client";

export type AdminEvidenceRecord = {
  id: string;
  publisher: string;
  title: string;
  year: number | null;
  link: string | null;
  jurisdictions: string;
  context: string;
  subCategory: string | null;
  engagementLevel: string;
  minHourlyRate: number | null;
  maxHourlyRate: number | null;
  reimbursementGuidance: boolean;
  unpaidEngagementGuidance: boolean;
  exampleOrganisations: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EvidenceFormValues = Omit<AdminEvidenceRecord, "id" | "createdAt" | "updatedAt">;

const ADMIN_JURISDICTION_OPTIONS = [
  {
    value: "ACT",
    label: "Australian Capital Territory",
  },
  {
    value: "National",
    label: "National",
  },
  {
    value: "NSW",
    label: "New South Wales",
  },
  {
    value: "QLD",
    label: "Queensland",
  },
  {
    value: "SA",
    label: "South Australia",
  },
  {
    value: "TAS",
    label: "Tasmania",
  },
  {
    value: "VIC",
    label: "Victoria",
  },
  {
    value: "WA",
    label: "Western Australia",
  },
  {
    value: "NT",
    label: "Northern Territory",
  },
] as const;

type RecordFormPageProps = {
  mode: "create" | "edit";
  value: EvidenceFormValues;
  isSubmitting: boolean;
  error: string;
  onChange: (value: EvidenceFormValues) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

function updateTextField(
  value: EvidenceFormValues,
  field: keyof EvidenceFormValues,
  fieldValue: string,
): EvidenceFormValues {
  if (field === "year" || field === "minHourlyRate" || field === "maxHourlyRate") {
    return { ...value, [field]: fieldValue === "" ? null : Number(fieldValue) };
  }
  return { ...value, [field]: fieldValue };
}

function hasRequiredFields(value: EvidenceFormValues): boolean {
  return Boolean(
    value.publisher.trim() &&
      value.title.trim() &&
      value.jurisdictions.trim() &&
      value.context.trim() &&
      isPositiveIntegerText(value.engagementLevel),
  );
}

function isPositiveIntegerText(value: string): boolean {
  return /^[1-9]\d*$/.test(value.trim());
}

/** CAKE-11 - RecordFormPage */
export function RecordFormPage({
  mode,
  value,
  isSubmitting,
  error,
  onChange,
  onCancel,
  onSubmit,
}: RecordFormPageProps) {
  const canSubmit = hasRequiredFields(value);

  return (
    <form
      className="bg-white"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) {
          return;
        }
        onSubmit();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          label="Publisher"
          required
          value={value.publisher}
          onChange={(nextValue) => onChange(updateTextField(value, "publisher", nextValue))}
        />
        <TextInput
          label="Year"
          type="number"
          value={value.year ?? ""}
          onChange={(nextValue) => onChange(updateTextField(value, "year", nextValue))}
        />
        <div className="md:col-span-2">
          <TextInput
            label="Title"
            required
            value={value.title}
            onChange={(nextValue) => onChange(updateTextField(value, "title", nextValue))}
          />
        </div>
        <div className="md:col-span-2">
          <TextInput
            label="Link"
            type="url"
            value={value.link ?? ""}
            onChange={(nextValue) => onChange(updateTextField(value, "link", nextValue))}
          />
        </div>
        <SelectInput
          label="Jurisdictions"
          required
          value={value.jurisdictions}
          onChange={(nextValue) => onChange({ ...value, jurisdictions: nextValue })}
          options={ADMIN_JURISDICTION_OPTIONS}
        />
        <TextInput
          label="Context"
          required
          value={value.context}
          onChange={(nextValue) => onChange(updateTextField(value, "context", nextValue))}
        />
        <TextInput
          label="Sub-category"
          value={value.subCategory ?? ""}
          onChange={(nextValue) => onChange(updateTextField(value, "subCategory", nextValue))}
        />
        <TextInput
          label="Engagement level"
          type="number"
          min="1"
          step="1"
          required
          value={value.engagementLevel}
          onChange={(nextValue) => onChange(updateTextField(value, "engagementLevel", nextValue))}
        />
        <TextInput
          label="Minimum hourly rate"
          type="number"
          min="0"
          step="0.01"
          value={value.minHourlyRate ?? ""}
          onChange={(nextValue) => onChange(updateTextField(value, "minHourlyRate", nextValue))}
        />
        <TextInput
          label="Maximum hourly rate"
          type="number"
          min="0"
          step="0.01"
          value={value.maxHourlyRate ?? ""}
          onChange={(nextValue) => onChange(updateTextField(value, "maxHourlyRate", nextValue))}
        />
        <div className="md:col-span-2">
          <TextArea
            label="Example organisations"
            value={value.exampleOrganisations ?? ""}
            onChange={(nextValue) =>
              onChange(updateTextField(value, "exampleOrganisations", nextValue))
            }
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Checkbox
          label="Includes reimbursement guidance"
          checked={value.reimbursementGuidance}
          onChange={(checked) => onChange({ ...value, reimbursementGuidance: checked })}
        />
        <Checkbox
          label="Includes unpaid engagement guidance"
          checked={value.unpaidEngagementGuidance}
          onChange={(checked) => onChange({ ...value, unpaidEngagementGuidance: checked })}
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {!canSubmit && (
          <p className="flex items-center text-sm font-semibold text-red-700">
            Complete required fields marked with *.
          </p>
        )}
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0b3b4a] px-4 py-2.5 text-base font-bold text-white transition hover:bg-[#0a3340] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? "Saving..."
            : mode === "edit"
              ? "Save changes"
              : "Create record"}
        </button>
      </div>
    </form>
  );
}

type TextInputProps = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  min?: string;
  step?: string;
  placeholder?: string;
};

function TextInput({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  min,
  step,
  placeholder,
}: TextInputProps) {
  const id = `evidence-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
      {label}
      {required ? <span className="ml-1 text-red-700">*</span> : null}
      <input
        id={id}
        type={type}
        min={min}
        step={step}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-normal text-slate-900 outline-none ring-teal-500 focus:border-teal-500 focus:ring-2"
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  const id = `evidence-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
      {label}
      {required ? <span className="ml-1 text-red-700">*</span> : null}
      <select
        id={id}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900 outline-none ring-teal-500 focus:border-teal-500 focus:ring-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `evidence-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
      {label}
      <textarea
        id={id}
        value={value}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-normal text-slate-900 outline-none ring-teal-500 focus:border-teal-500 focus:ring-2"
      />
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
      />
      {label}
    </label>
  );
}

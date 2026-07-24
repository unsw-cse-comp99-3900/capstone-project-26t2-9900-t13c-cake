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
      value.engagementLevel.trim(),
  );
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
      aria-busy={isSubmitting}
      aria-describedby="evidence-form-required"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) {
          return;
        }
        onSubmit();
      }}
    >
      <p id="evidence-form-required" className="mb-4 text-sm leading-6 text-slate-700">
        Fields marked with an asterisk are required. Use plain words and enter comma-separated
        values where noted.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          label="Publisher"
          description="The organisation that published the evidence."
          required
          value={value.publisher}
          onChange={(nextValue) => onChange(updateTextField(value, "publisher", nextValue))}
        />
        <TextInput
          label="Year"
          description="Enter the four-digit publication year, if known."
          type="number"
          value={value.year ?? ""}
          onChange={(nextValue) => onChange(updateTextField(value, "year", nextValue))}
        />
        <div className="md:col-span-2">
          <TextInput
            label="Title"
            description="Use the title shown on the source document or webpage."
            required
            value={value.title}
            onChange={(nextValue) => onChange(updateTextField(value, "title", nextValue))}
          />
        </div>
        <div className="md:col-span-2">
          <TextInput
            label="Link"
            description="Enter the full source address, including https://."
            type="url"
            value={value.link ?? ""}
            onChange={(nextValue) => onChange(updateTextField(value, "link", nextValue))}
          />
        </div>
        <TextInput
          label="Jurisdictions"
          description="Separate multiple locations with commas, for example: National, NSW."
          required
          value={value.jurisdictions}
          placeholder="National,NSW"
          onChange={(nextValue) => onChange(updateTextField(value, "jurisdictions", nextValue))}
        />
        <TextInput
          label="Context"
          description="Enter the broad health or research area used by the questionnaire."
          required
          value={value.context}
          onChange={(nextValue) => onChange(updateTextField(value, "context", nextValue))}
        />
        <TextInput
          label="Sub-category"
          description="Add a narrower area only when one applies."
          value={value.subCategory ?? ""}
          onChange={(nextValue) => onChange(updateTextField(value, "subCategory", nextValue))}
        />
        <TextInput
          label="Engagement level"
          description="Enter the consumer engagement level used by the questionnaire."
          required
          value={value.engagementLevel}
          onChange={(nextValue) => onChange(updateTextField(value, "engagementLevel", nextValue))}
        />
        <TextInput
          label="Minimum hourly rate"
          description="Enter an amount in Australian dollars without the dollar sign."
          type="number"
          min="0"
          step="0.01"
          value={value.minHourlyRate ?? ""}
          onChange={(nextValue) => onChange(updateTextField(value, "minHourlyRate", nextValue))}
        />
        <TextInput
          label="Maximum hourly rate"
          description="Enter an amount in Australian dollars without the dollar sign."
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
        <p
          id="evidence-form-error"
          role="alert"
          className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900"
        >
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
  description?: string;
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
  description,
}: TextInputProps) {
  const id = `evidence-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const descriptionId = `${id}-description`;

  return (
    <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
      {label}
      {required ? <span aria-hidden="true" className="ml-1 text-red-700">*</span> : null}
      <input
        id={id}
        type={type}
        min={min}
        step={step}
        required={required}
        value={value}
        placeholder={placeholder}
        aria-describedby={description ? descriptionId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-normal text-slate-900 outline-none ring-teal-500 focus:border-teal-500 focus:ring-2"
      />
      {description ? (
        <span id={descriptionId} className="mt-1 block text-sm font-normal leading-5 text-slate-700">
          {description}
        </span>
      ) : null}
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

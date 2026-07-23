"use client";

import { useQuizState } from "@/contexts/QuizStateContext";
import { useLanguage } from "@/contexts/LanguageContext";

type ContextSelectionOptions = {
  context: string;
  subCategories: string[];
  engagementLevelsBySubCategory: Record<string, string[]>;
};

type ContextStepProps = {
  contexts: string[];
  selectionOptions: ContextSelectionOptions[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  isSubmitting: boolean;
  onSubmit: () => void;
};

const ENGAGEMENT_LEVEL_DETAILS: Record<string, { label: string; description: string }> = {
  Inform: {
    label: "Level 1",
    description: "One-way communication: consumers receive information.",
  },
  Consult: {
    label: "Level 2",
    description: "Two-way feedback on predefined options.",
  },
  Involve: {
    label: "Level 3",
    description: "Consumers work alongside staff throughout the process.",
  },
  Collaborate: {
    label: "Level 4",
    description: "Partnership in each aspect of the decision.",
  },
  Empower: {
    label: "Level 5",
    description: "Final decision rests with consumers.",
  },
  "Extended roles": {
    label: "Levels 6-7",
    description: "Governance or leadership-level consumer roles.",
  },
};

/** CAKE-3 - ContextStep */
export function ContextStep({
  contexts,
  selectionOptions,
  isLoading,
  error,
  onRetry,
  isSubmitting,
  onSubmit,
}: ContextStepProps) {
  const { t, language } = useLanguage();
  const {
    answers,
    toggleContext,
    setSelectionSubCategory,
    setSelectionEngagementLevel,
    setCurrentStep,
  } = useQuizState();
  const selectedContexts = new Set(
    answers.selections.map((selection) => selection.context),
  );
  const selectionOptionsByContext = new Map(
    selectionOptions.map((options) => [options.context, options]),
  );
  const canSubmit =
    answers.selections.length > 0 &&
    answers.selections.every((selection) => {
      const options = selectionOptionsByContext.get(selection.context);
      const engagementLevels =
        options?.engagementLevelsBySubCategory[selection.subCategory ?? ""] ?? [];

      return (
        selection.engagementLevel !== null &&
        engagementLevels.includes(selection.engagementLevel)
      );
    }) &&
    !isLoading &&
    !error &&
    !isSubmitting;

  return (
    <section
      aria-labelledby="context-heading"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6"
    >
      <div className="max-w-3xl">
        <h2
          id="context-heading"
          className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
        >
          {t("contextHeading")}
        </h2>
        <p id="context-help" className="mt-2 text-sm leading-6 text-slate-700">
          {t("contextHelp")}
        </p>
      </div>

      {isLoading ? (
        <div role="status" aria-live="polite" className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          {t("loadingOptions")}
        </div>
      ) : error ? (
        <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 min-h-10 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            {t("tryAgain")}
          </button>
        </div>
      ) : (
        <>
          <fieldset className="mt-5" aria-describedby="context-help">
            <legend className="sr-only">{t("selectContexts")}</legend>
            <div className="grid gap-3 md:grid-cols-2">
              {contexts.map((context) => {
                const optionId = `context-${context.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
                const isSelected = selectedContexts.has(context);

                return (
                  <label
                    key={context}
                    htmlFor={optionId}
                    className={[
                      "cursor-pointer rounded-xl border p-4 transition",
                      "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-teal-700",
                      isSelected
                        ? "border-teal-600 bg-teal-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        id={optionId}
                        type="checkbox"
                        name="context"
                        value={context}
                        checked={isSelected}
                        onChange={() => toggleContext(context)}
                        className="mt-1 size-5 border-slate-300 text-teal-700 accent-teal-700"
                      />
                      <span className="text-base font-bold text-slate-950">{context}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {answers.selections.length > 0 ? (
            <div className="mt-5 space-y-4">
              {answers.selections.map((selection) => {
                const options = selectionOptionsByContext.get(selection.context);
                const subCategoryKey = selection.subCategory ?? "";
                const engagementLevels =
                  options?.engagementLevelsBySubCategory[subCategoryKey] ?? [];

                return (
                  <section
                    key={selection.context}
                    aria-labelledby={`selection-${selection.context.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3
                          id={`selection-${selection.context.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                          className="text-lg font-bold text-slate-950"
                        >
                          {selection.context}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {t("configureContext")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleContext(selection.context)}
                        aria-label={`Remove ${selection.context} context`}
                        className="min-h-9 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                      >
                        {t("remove")}
                      </button>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor={`sub-category-${selection.context.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                        className="block text-sm font-bold text-slate-800"
                      >
                        {t("subCategory")}
                      </label>
                      <select
                        id={`sub-category-${selection.context.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                        value={selection.subCategory ?? ""}
                        onChange={(event) =>
                          setSelectionSubCategory(
                            selection.context,
                            event.target.value || null,
                          )
                        }
                        className="mt-2 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-3 focus:outline-offset-2 focus:outline-teal-700"
                      >
                        <option value="">{t("noSpecificSubCategory")}</option>
                        {options?.subCategories.map((subCategory) => (
                          <option key={subCategory} value={subCategory}>
                            {subCategory}
                          </option>
                        ))}
                      </select>
                    </div>

                    {engagementLevels.length === 0 ? (
                      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
                        {t("noEvidence")}
                      </div>
                    ) : (
                      <fieldset className="mt-4">
                        <legend className="text-sm font-bold text-slate-800">
                          {t("engagementLevel")}
                        </legend>
                        <div className="mt-2 grid gap-3 md:grid-cols-2">
                          {engagementLevels.map((engagementLevel) => {
                            const details = ENGAGEMENT_LEVEL_DETAILS[engagementLevel];
                            const engagementId = `engagement-${selection.context}-${engagementLevel}`
                              .replace(/[^a-z0-9]+/gi, "-")
                              .toLowerCase();
                            const isSelected =
                              selection.engagementLevel === engagementLevel;

                            return (
                              <label
                                key={engagementLevel}
                                htmlFor={engagementId}
                                className={[
                                  "cursor-pointer rounded-xl border p-4 transition",
                                  "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-teal-700",
                                  isSelected
                                    ? "border-teal-600 bg-teal-50 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-teal-300 hover:bg-white",
                                ].join(" ")}
                              >
                                <div className="flex items-start gap-4">
                                  <input
                                    id={engagementId}
                                    type="radio"
                                    name={`engagement-${selection.context}`}
                                    value={engagementLevel}
                                    checked={isSelected}
                                    onChange={() =>
                                      setSelectionEngagementLevel(
                                        selection.context,
                                        engagementLevel,
                                      )
                                    }
                                    className="mt-1 size-5 border-slate-300 text-teal-700 accent-teal-700"
                                  />
                                  <span>
                                    <span className="block text-sm font-bold text-teal-700">
                                      {details?.label ?? t("additionalLevel")}
                                    </span>
                                    <span className="mt-1 block text-base font-bold text-slate-950">
                                      {engagementLevel}
                                    </span>
                                    <span className="mt-2 block text-sm leading-6 text-slate-600">
                                      {language === "zh-CN"
                                        ? t("evidenceLevel")
                                        : details?.description ?? t("evidenceLevel")}
                                    </span>
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                    )}
                  </section>
                );
              })}
            </div>
          ) : null}
        </>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          disabled={isSubmitting}
          className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t("back")}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="min-h-10 rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none"
        >
          {isSubmitting ? t("findingGuidance") : t("viewResults")}
        </button>
      </div>
    </section>
  );
}

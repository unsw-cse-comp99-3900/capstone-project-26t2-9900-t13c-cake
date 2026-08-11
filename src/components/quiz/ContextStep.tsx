"use client";

import Image from "next/image";
import { useQuizState } from "@/contexts/QuizStateContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateLevelLabel, translateOption } from "@/i18n/optionTranslations";
import { JURISDICTIONS } from "@/lib/constants/quizOptions";

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

const ENGAGEMENT_LEVEL_DETAILS: Record<
  string,
  { label: string; categoryCount: number; description: string }
> = {
  "1": {
    label: "Level 1",
    categoryCount: 1,
    description: "1 remuneration category present within the document.",
  },
  "2": {
    label: "Level 2",
    categoryCount: 2,
    description: "2 remuneration categories present within the document.",
  },
  "3": {
    label: "Level 3",
    categoryCount: 3,
    description: "3 remuneration categories present within the document.",
  },
  "4": {
    label: "Level 4",
    categoryCount: 4,
    description: "4 remuneration categories present within the document.",
  },
  "5": {
    label: "Level 5",
    categoryCount: 5,
    description: "5 remuneration categories present within the document.",
  },
  "6": {
    label: "Level 6",
    categoryCount: 6,
    description: "6 remuneration categories present within the document.",
  },
  "7": {
    label: "Level 7",
    categoryCount: 7,
    description: "7 remuneration categories present within the document.",
  },
  "11": {
    label: "Level 11",
    categoryCount: 11,
    description: "11 remuneration categories present within the document.",
  },
  Inform: {
    label: "Level 1",
    categoryCount: 1,
    description: "1 remuneration category present within the document.",
  },
  Consult: {
    label: "Level 2",
    categoryCount: 2,
    description: "2 remuneration categories present within the document.",
  },
  Involve: {
    label: "Level 3",
    categoryCount: 3,
    description: "3 remuneration categories present within the document.",
  },
  Collaborate: {
    label: "Level 4",
    categoryCount: 4,
    description: "4 remuneration categories present within the document.",
  },
  Empower: {
    label: "Level 5",
    categoryCount: 5,
    description: "5 remuneration categories present within the document.",
  },
  "Extended roles": {
    label: "Level 6",
    categoryCount: 6,
    description: "6 remuneration categories present within the document.",
  },
};

function formatCategoryCount(language: string, count: number): string {
  if (language === "zh-CN") {
    return `覆盖 ${count} 个类别`;
  }

  return `${count} ${count === 1 ? "category" : "categories"} covered`;
}

function getEngagementLevelDetails(engagementLevel: string): {
  label: string;
  categoryCount: number;
} | null {
  const details = ENGAGEMENT_LEVEL_DETAILS[engagementLevel];
  if (details) {
    return details;
  }

  const categoryCount = Number(engagementLevel);
  if (Number.isInteger(categoryCount) && categoryCount > 0) {
    return {
      label: `Level ${categoryCount}`,
      categoryCount,
    };
  }

  return null;
}

function slug(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}
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
    setSelectionEngagementLevels,
    setCurrentStep,
  } = useQuizState();
  const selectedContexts = new Set(
    answers.selections.map((selection) => selection.context),
  );
  const selectionOptionsByContext = new Map(
    selectionOptions.map((options) => [options.context, options]),
  );
  const jurisdictionLabels = new Map<string, string>(
    JURISDICTIONS.map((jurisdiction) => [
      jurisdiction.value,
      translateOption(language, jurisdiction.label),
    ]),
  );
  const selectedJurisdictionText = answers.jurisdictions
    .map((jurisdiction) => jurisdictionLabels.get(jurisdiction) ?? jurisdiction)
    .join(", ");
  const canSubmit =
    answers.selections.length > 0 &&
    answers.selections.every((selection) => {
      const options = selectionOptionsByContext.get(selection.context);
      const engagementLevels =
        options?.engagementLevelsBySubCategory[selection.subCategory ?? ""] ?? [];
      const availableEngagementLevels = new Set(engagementLevels);

      return (
        selection.engagementLevels.length > 0 &&
        selection.engagementLevels.every((engagementLevel) =>
          availableEngagementLevels.has(engagementLevel),
        )
      );
    }) &&
    !isLoading &&
    !error &&
    !isSubmitting;

  return (
    <section
      aria-labelledby="context-heading"
      className="mt-8 grid gap-6 md:grid-cols-[minmax(210px,0.36fr)_minmax(0,1fr)] md:items-start lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-12"
    >
      <div className="relative overflow-visible pb-2 md:sticky md:top-8 md:min-h-[520px] md:pb-48">
        <p className="relative z-10 text-xs font-bold uppercase tracking-[0.22em] text-[#006b63]">
          {t("stepTwoLabel")}
        </p>
        <h2
          id="context-heading"
          className="relative z-10 mt-3 max-w-2xl font-[Georgia,serif] text-3xl font-normal leading-tight tracking-tight text-[#051b1a] sm:text-4xl md:max-w-[230px] md:text-[2.35rem] lg:max-w-[285px] lg:text-[2.7rem] xl:mt-5 xl:max-w-[320px] xl:text-[2.82rem]"
        >
          {t("contextHeroTitle")}
        </h2>
        <div className="relative z-10 mt-5 h-0.5 w-12 bg-[#006b63] md:mt-7 md:w-14" />
        <p className="relative z-10 mt-5 max-w-2xl text-base leading-7 text-slate-600 md:mt-7 md:max-w-[250px] md:text-sm md:leading-7 lg:max-w-[285px] lg:text-base lg:leading-8">
          {t("contextHeroHelp")}
        </p>
        <div className="relative z-10 mt-8 flex max-w-[260px] items-center gap-4 rounded-[10px] border border-[#a9d3cc] bg-[#edf8f5] px-4 py-4 text-sm leading-5 shadow-[0_14px_26px_rgba(0,79,72,0.06)]">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#005f57] text-white shadow-[0_10px_18px_rgba(0,79,72,0.16)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21s6-5.4 6-11a6 6 0 0 0-12 0c0 5.6 6 11 6 11Z" />
              <circle cx="12" cy="10" r="2" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-xs text-slate-600">{t("selectedLocations")}</p>
            <p className="mt-1 text-sm font-medium text-slate-950">
              {selectedJurisdictionText}
            </p>
          </div>
        </div>
        <Image
          src="/decor/questionnaire-leaves.svg"
          alt=""
          aria-hidden="true"
          width={520}
          height={340}
          className="pointer-events-none absolute bottom-[-42px] left-[-185px] z-0 hidden w-[620px] opacity-64 md:block lg:bottom-[-52px] lg:left-[-220px] lg:w-[760px]"
        />
      </div>

      <div className="rounded-[24px] border border-[#a9d3cc] bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] sm:p-7 lg:p-10">
        <div>
          <h3 className="font-[Georgia,serif] text-3xl font-normal leading-tight tracking-tight text-[#050817] lg:text-4xl">
            {t("contextHeading")}
          </h3>
          <p id="context-help" className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 lg:text-base">
            {t("contextHelp")}
          </p>
        </div>

        {isLoading ? (
          <div role="status" aria-live="polite" className="mt-7 rounded-[14px] border border-[#dce6e4] bg-[#f7fbfa] p-4 text-sm font-semibold text-slate-700">
            {t("loadingOptions")}
          </div>
        ) : error ? (
          <div role="alert" className="mt-7 rounded-[14px] border border-red-200 bg-red-50 p-4 text-red-950">
            <p className="font-semibold">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 min-h-10 rounded-[12px] bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            >
              {t("tryAgain")}
            </button>
          </div>
        ) : (
          <>
            <fieldset className="mt-7" aria-describedby="context-help">
              <legend className="mb-3 text-sm font-bold text-[#003f3b]">
                {t("selectContexts")}
              </legend>
              <div className="grid gap-4 md:grid-cols-2">
                {contexts.map((context) => {
                  const optionId = `context-${slug(context)}`;
                  const isSelected = selectedContexts.has(context);

                  return (
                    <label
                      key={context}
                      htmlFor={optionId}
                      className={[
                        "group cursor-pointer rounded-[8px] border px-4 py-4 transition lg:px-5 lg:py-5",
                        "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-teal-700",
                        isSelected
                          ? "border-[#006b63] bg-[#e8f7f3]"
                          : "border-[#dce6e4] bg-white hover:border-[#b8d9d4] hover:bg-[#fbfefd]",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          id={optionId}
                          type="checkbox"
                          name="context"
                          value={context}
                          checked={isSelected}
                          onChange={() => toggleContext(context)}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={[
                            "flex size-5 shrink-0 items-center justify-center rounded-[4px] border text-sm font-bold transition",
                            isSelected
                              ? "border-[#006b63] bg-[#006b63] text-white"
                              : "border-[#cfd9d7] bg-white text-transparent group-hover:border-[#b8d9d4]",
                          ].join(" ")}
                        >
                          ✓
                        </span>
                        <span className="min-w-0 text-sm font-bold text-slate-950 lg:text-base">
                          {translateOption(language, context)}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {answers.selections.length > 0 ? (
              <div className="mt-7 space-y-5">
                {answers.selections.map((selection) => {
                  const options = selectionOptionsByContext.get(selection.context);
                  const subCategoryKey = selection.subCategory ?? "";
                  const engagementLevels =
                    options?.engagementLevelsBySubCategory[subCategoryKey] ?? [];
                  const selectionId = slug(selection.context);
                  const selectedEngagementLevels = new Set(selection.engagementLevels);
                  const hasSelectedAllEngagementLevels =
                    engagementLevels.length > 0 &&
                    engagementLevels.every((engagementLevel) =>
                      selectedEngagementLevels.has(engagementLevel),
                    );

                  return (
                    <section
                      key={selection.context}
                      aria-labelledby={`selection-${selectionId}`}
                      className="rounded-[8px] border border-[#d6dcdd] bg-[#f6f7f7] p-4 lg:p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h4
                            id={`selection-${selectionId}`}
                            className="text-sm font-bold text-[#003f3b]"
                          >
                            {translateOption(language, selection.context)}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleContext(selection.context)}
                          aria-label={`Remove ${selection.context} context`}
                          className="min-h-9 rounded-[4px] border border-[#006b63] bg-white/70 px-4 py-1.5 text-sm font-medium text-[#005f57] transition hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                        >
                          {t("remove")}
                        </button>
                      </div>

                      <div className="mt-4 max-w-[530px]">
                        <label
                          htmlFor={`sub-category-${selectionId}`}
                          className="block text-sm font-medium text-slate-950"
                        >
                          {t("subCategory")}
                        </label>
                        <div className="relative mt-2">
                          <select
                            id={`sub-category-${selectionId}`}
                            value={selection.subCategory ?? ""}
                            onChange={(event) =>
                              setSelectionSubCategory(
                                selection.context,
                                event.target.value || null,
                              )
                            }
                            className="min-h-10 w-full appearance-none rounded-[4px] border border-[#8f9aa3] bg-white px-4 py-2 pr-10 text-sm text-slate-900 shadow-[inset_0_1px_1px_rgba(15,23,42,0.04)] focus:outline-3 focus:outline-offset-2 focus:outline-teal-700"
                          >
                            <option value="">{t("noSpecificSubCategory")}</option>
                            {options?.subCategories.map((subCategory) => (
                              <option key={subCategory} value={subCategory}>
                                {translateOption(language, subCategory)}
                              </option>
                            ))}
                          </select>
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 20 20"
                            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-700"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m5 8 5 5 5-5" />
                          </svg>
                        </div>
                      </div>

                      {engagementLevels.length === 0 ? (
                        <div className="mt-5 rounded-[12px] border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
                          {t("noEvidence")}
                        </div>
                      ) : (
                        <fieldset className="mt-5">
                          <legend className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800">
                            <span>{t("engagementLevel")}</span>
                            <span
                              tabIndex={0}
                              aria-label="Evidence coverage explanation"
                              className="group relative inline-grid size-6 place-items-center rounded-full border border-[#cbd8df] bg-white text-sm font-bold text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.05)] focus:outline-2 focus:outline-offset-2 focus:outline-teal-700"
                            >
                              ?
                              <span className="pointer-events-none absolute left-1/2 top-8 z-20 hidden w-72 -translate-x-1/2 rounded-[6px] border border-[#dce6e4] bg-white p-3 text-left text-xs font-medium leading-5 text-slate-700 shadow-lg group-hover:block group-focus-within:block">
                                It means the number of categories of remuneration
                                present within each document. The larger the number,
                                the more detailed the level of division in the
                                document.
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectionEngagementLevels(
                                  selection.context,
                                  hasSelectedAllEngagementLevels ? [] : engagementLevels,
                                )
                              }
                              className="ml-1 rounded-[4px] px-1.5 py-0.5 text-sm font-bold text-[#006b63] transition hover:text-[#004f49] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                            >
                              Select all
                            </button>
                          </legend>
                          <div className="mt-3 grid gap-4 md:grid-cols-2">
                            {engagementLevels.map((engagementLevel) => {
                              const details = getEngagementLevelDetails(engagementLevel);
                              const engagementId = `engagement-${selection.context}-${engagementLevel}`
                                .replace(/[^a-z0-9]+/gi, "-")
                                .toLowerCase();
                              const isSelected =
                                selectedEngagementLevels.has(engagementLevel);

                              return (
                                <label
                                  key={engagementLevel}
                                  htmlFor={engagementId}
                                  className={[
                                    "group cursor-pointer rounded-[8px] border px-4 py-4 transition lg:px-5 lg:py-5",
                                    "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-teal-700",
                                    isSelected
                                      ? "border-[#006b63] bg-[#e8f7f3]"
                                      : "border-[#dce6e4] bg-white hover:border-[#b8d9d4] hover:bg-[#fbfefd]",
                                  ].join(" ")}
                                >
                                  <div className="flex items-start gap-4">
                                    <input
                                      id={engagementId}
                                      type="checkbox"
                                      name={`engagement-${selection.context}`}
                                      value={engagementLevel}
                                      checked={isSelected}
                                      onChange={(event) =>
                                        setSelectionEngagementLevels(
                                          selection.context,
                                          event.target.checked
                                            ? [...selection.engagementLevels, engagementLevel]
                                            : selection.engagementLevels.filter(
                                                (selectedLevel) =>
                                                  selectedLevel !== engagementLevel,
                                              ),
                                        )
                                      }
                                      className="peer sr-only"
                                    />
                                    <span
                                      aria-hidden="true"
                                      className={[
                                        "flex size-5 shrink-0 items-center justify-center rounded-[4px] border text-sm font-bold transition",
                                        isSelected
                                          ? "border-[#006b63] bg-[#006b63] text-white"
                                          : "border-[#cfd9d7] bg-white text-transparent group-hover:border-[#b8d9d4]",
                                      ].join(" ")}
                                    >
                                      ✓
                                    </span>
                                    <span>
                                      <span className="mt-1 block text-xs font-bold uppercase tracking-[0.16em] text-[#006b63]">
                                        {details
                                          ? translateLevelLabel(language, details.label)
                                          : t("additionalLevel")}
                                      </span>
                                      <span className="mt-1 block text-base font-bold text-slate-950">
                                        {details
                                          ? formatCategoryCount(language, details.categoryCount)
                                          : engagementLevel}
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

        <div className="mt-8 flex flex-col gap-4 border-t border-[#dce6e4] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            disabled={isSubmitting}
            className="min-h-12 rounded-[14px] border border-[#cfd9d7] px-6 py-3 text-sm font-bold text-slate-600 transition hover:border-[#006b63] hover:bg-[#f3fbf8] hover:text-[#003f3b] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t("back")}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="min-h-12 rounded-[14px] border border-[#006b63] px-7 py-3 text-sm font-bold text-[#003f3b] transition hover:bg-[#006b63] hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:border-[#cfd9d7] disabled:bg-[#e1e9eb] disabled:text-slate-500 disabled:hover:text-slate-500"
          >
            {isSubmitting ? t("findingGuidance") : t("viewResults")}
          </button>
        </div>
      </div>
    </section>
  );
}

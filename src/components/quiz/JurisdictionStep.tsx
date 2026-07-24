"use client";

import { JURISDICTIONS } from "@/lib/constants/quizOptions";
import { useQuizState } from "@/contexts/QuizStateContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateOption } from "@/i18n/optionTranslations";

/** CAKE-3 — JurisdictionStep */
export function JurisdictionStep() {
  const { answers, toggleJurisdiction, clearJurisdictions, setCurrentStep } = useQuizState();
  const { t, language } = useLanguage();
  const hasSelection = answers.jurisdictions.length > 0;

  return (
    <section
      aria-labelledby="jurisdiction-heading"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6"
    >
      <div className="max-w-3xl">
        <h2
          id="jurisdiction-heading"
          className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
        >
          {t("jurisdictionHeading")}
        </h2>
        <p id="jurisdiction-help" className="mt-2 text-sm leading-6 text-slate-700">
          {t("jurisdictionHelp")}
        </p>
      </div>

      <fieldset className="mt-5" aria-describedby="jurisdiction-help">
        <legend className="sr-only">{t("selectJurisdictions")}</legend>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {JURISDICTIONS.map((jurisdiction) => {
            const optionId = `jurisdiction-${jurisdiction.value.toLowerCase()}`;
            const isSelected = answers.jurisdictions.includes(jurisdiction.value);

            return (
              <label
                key={jurisdiction.value}
                htmlFor={optionId}
                className={[
                  "group cursor-pointer rounded-xl border p-4 transition",
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
                    value={jurisdiction.value}
                    checked={isSelected}
                    onChange={() => toggleJurisdiction(jurisdiction.value)}
                    className="mt-1 size-5 rounded border-slate-300 text-teal-700 accent-teal-700"
                  />
                  <span>
                    <span className="block text-base font-bold text-slate-950">
                      {translateOption(language, jurisdiction.label)}
                    </span>
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-slate-600" aria-live="polite">
          {hasSelection
            ? t("selectedJurisdictions", { count: answers.jurisdictions.length })
            : t("chooseJurisdiction")}
        </p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={clearJurisdictions}
            disabled={!hasSelection}
            className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t("clearSelection")}
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            disabled={!hasSelection}
            className="min-h-10 rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none"
          >
            {t("continue")}
          </button>
        </div>
      </div>
    </section>
  );
}

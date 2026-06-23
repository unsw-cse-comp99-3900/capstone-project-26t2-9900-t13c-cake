"use client";

import { JURISDICTIONS } from "@/lib/constants/quizOptions";
import { useQuizState } from "@/contexts/QuizStateContext";

/** CAKE-3 — JurisdictionStep */
export function JurisdictionStep() {
  const { answers, toggleJurisdiction, clearJurisdictions } = useQuizState();
  const hasSelection = answers.jurisdictions.length > 0;

  return (
    <section
      aria-labelledby="jurisdiction-heading"
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
    >
      <div className="max-w-3xl">
        <h2
          id="jurisdiction-heading"
          className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
        >
          Which jurisdiction should the guidance apply to?
        </h2>
      </div>

      <fieldset className="mt-8">
        <legend className="sr-only">Select jurisdictions</legend>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {JURISDICTIONS.map((jurisdiction) => {
            const optionId = `jurisdiction-${jurisdiction.value.toLowerCase()}`;
            const isSelected = answers.jurisdictions.includes(jurisdiction.value);

            return (
              <label
                key={jurisdiction.value}
                htmlFor={optionId}
                className={[
                  "group cursor-pointer rounded-2xl border p-5 transition",
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
                      {jurisdiction.label}
                    </span>
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-slate-600" aria-live="polite">
          {hasSelection
            ? `${answers.jurisdictions.length} jurisdiction${answers.jurisdictions.length > 1 ? "s" : ""} selected`
            : "Choose at least one jurisdiction to continue."}
        </p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={clearJurisdictions}
            disabled={!hasSelection}
            className="min-h-11 rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Clear selection
          </button>
          <button
            type="button"
            disabled={!hasSelection}
            className="min-h-11 rounded-lg bg-teal-700 px-5 py-2.5 font-bold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none"
          >
            Continue
          </button>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useQuizState } from "@/contexts/QuizStateContext";

type ContextStepProps = {
  contexts: string[];
  subCategories: string[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

/** CAKE-3 - ContextStep */
export function ContextStep({
  contexts,
  subCategories,
  isLoading,
  error,
  onRetry,
}: ContextStepProps) {
  const { answers, setContext, setSubCategory, setCurrentStep } = useQuizState();
  const canContinue = Boolean(answers.context) && !isLoading && !error;

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
          What is the health or research context?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Choose the broad area of work, then narrow it with a sub-category if one applies.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          Loading options from the evidence database...
        </div>
      ) : error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 min-h-10 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <fieldset className="mt-5">
            <legend className="sr-only">Select context</legend>
            <div className="grid gap-3 md:grid-cols-2">
              {contexts.map((context) => {
                const optionId = `context-${context.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
                const isSelected = answers.context === context;

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
                        type="radio"
                        name="context"
                        value={context}
                        checked={isSelected}
                        onChange={() => setContext(context)}
                        className="mt-1 size-5 border-slate-300 text-teal-700 accent-teal-700"
                      />
                      <span className="text-base font-bold text-slate-950">{context}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-5">
            <label htmlFor="sub-category" className="block text-sm font-bold text-slate-800">
              Sub-category
            </label>
            <select
              id="sub-category"
              value={answers.subCategory ?? ""}
              onChange={(event) => setSubCategory(event.target.value || null)}
              className="mt-2 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-3 focus:outline-offset-2 focus:outline-teal-700"
            >
              <option value="">No specific sub-category</option>
              {subCategories.map((subCategory) => (
                <option key={subCategory} value={subCategory}>
                  {subCategory}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          disabled={!canContinue}
          className="min-h-10 rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none"
        >
          Continue
        </button>
      </div>
    </section>
  );
}

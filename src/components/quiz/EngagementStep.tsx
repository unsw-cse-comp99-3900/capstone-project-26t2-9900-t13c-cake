"use client";

import { useQuizState } from "@/contexts/QuizStateContext";

type EngagementStepProps = {
  engagementLevels: string[];
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

/** CAKE-3 - EngagementStep */
export function EngagementStep({
  engagementLevels,
  isSubmitting,
  onSubmit,
}: EngagementStepProps) {
  const { answers, setEngagementLevel, setCurrentStep } = useQuizState();
  const canSubmit = Boolean(answers.engagementLevel) && !isSubmitting;

  return (
    <section
      aria-labelledby="engagement-heading"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6"
    >
      <div className="max-w-3xl">
        <h2
          id="engagement-heading"
          className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
        >
          What is the consumer engagement level?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Select the level that best describes how consumers are involved.
        </p>
      </div>

      {engagementLevels.length === 0 ? (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-lg font-bold text-slate-950">No engagement levels found</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Go back and broaden the jurisdiction or sub-category selection.
          </p>
        </div>
      ) : (
        <fieldset className="mt-5">
          <legend className="sr-only">Select engagement level</legend>
          <div className="grid gap-3 md:grid-cols-2">
            {engagementLevels.map((engagementLevel) => {
              const optionId = `engagement-${engagementLevel.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
              const isSelected = answers.engagementLevel === engagementLevel;
              const details = ENGAGEMENT_LEVEL_DETAILS[engagementLevel];

              return (
                <label
                  key={engagementLevel}
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
                      name="engagement-level"
                      value={engagementLevel}
                      checked={isSelected}
                      onChange={() => setEngagementLevel(engagementLevel)}
                      className="mt-1 size-5 border-slate-300 text-teal-700 accent-teal-700"
                    />
                    <span>
                      <span className="block text-sm font-bold text-teal-700">
                        {details?.label ?? "Additional level"}
                      </span>
                      <span className="mt-1 block text-base font-bold text-slate-950">
                        {engagementLevel}
                      </span>
                      <span className="mt-2 block text-sm leading-6 text-slate-600">
                        {details?.description ?? "Evidence-table engagement level."}
                      </span>
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          disabled={isSubmitting}
          className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="min-h-10 rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none"
        >
          {isSubmitting ? "Finding guidance..." : "View results"}
        </button>
      </div>
    </section>
  );
}

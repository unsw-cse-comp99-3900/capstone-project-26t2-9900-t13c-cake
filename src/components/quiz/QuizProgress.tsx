import type { QuizStep } from "@/contexts/QuizStateContext";

const steps = [
  "Jurisdiction",
  "Research context",
  "Engagement level",
] as const;

type QuizProgressProps = {
  currentStep: QuizStep;
};

/** CAKE-3 — quiz progress indicator */
export function QuizProgress({ currentStep }: QuizProgressProps) {
  return (
    <nav aria-label="Questionnaire progress">
      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCurrent = stepNumber === currentStep;
          const isComplete = stepNumber < currentStep;

          return (
            <li key={step} className="flex items-center gap-3 rounded-xl bg-white/70 p-3">
              <span
                className={[
                  "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  isCurrent
                    ? "bg-teal-700 text-white"
                    : isComplete
                      ? "bg-teal-100 text-teal-800"
                      : "bg-slate-200 text-slate-600",
                ].join(" ")}
                aria-current={isCurrent ? "step" : undefined}
              >
                {stepNumber}
              </span>
              <span className="text-sm font-semibold text-slate-800">{step}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

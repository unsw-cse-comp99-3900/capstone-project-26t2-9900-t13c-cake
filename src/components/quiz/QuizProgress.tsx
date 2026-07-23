import type { QuizStep } from "@/contexts/QuizStateContext";
import { useLanguage } from "@/contexts/LanguageContext";

type QuizProgressProps = {
  currentStep: QuizStep;
};

/** CAKE-3 — quiz progress indicator */
export function QuizProgress({ currentStep }: QuizProgressProps) {
  const { t } = useLanguage();
  const steps = [t("jurisdictionStep"), t("contextStep")];
  return (
    <nav aria-label={t("questionnaireProgress")}>
      <ol className="grid gap-2 sm:grid-cols-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCurrent = stepNumber === currentStep;
          const isComplete = stepNumber < currentStep;

          return (
            <li key={step} className="flex items-center gap-2 rounded-lg bg-white/70 p-2">
              <span
                className={[
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
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
              <span className="sr-only">
                {isCurrent ? t("currentStep") : isComplete ? t("completed") : t("notStarted")}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

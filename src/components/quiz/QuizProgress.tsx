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
    <nav aria-label={t("questionnaireProgress")} className="w-full">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#006b63]">
          Questionnaire
        </span>
        <span aria-hidden="true" className="h-6 w-px bg-[#b8cbc8]" />
        <ol className="flex flex-wrap items-center gap-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCurrent = stepNumber === currentStep;
          const isComplete = stepNumber < currentStep;

          return (
            <li key={step} className="flex items-center gap-3">
              {index > 0 ? (
                <span aria-hidden="true" className="hidden h-px w-28 bg-[#cbd8d6] md:block lg:w-56 xl:w-72" />
              ) : null}
              <span
                className={[
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  isCurrent
                    ? "bg-[#006b63] text-white"
                    : isComplete
                      ? "bg-[#d8f0eb] text-[#005f57]"
                      : "bg-[#e6eceb] text-slate-500",
                ].join(" ")}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isComplete ? "✓" : stepNumber}
              </span>
              <span
                className={[
                  "text-sm font-bold",
                  isCurrent
                    ? "text-[#003f3b]"
                    : isComplete
                      ? "text-[#005f57]"
                      : "text-slate-500",
                ].join(" ")}
              >
                {step}
              </span>
              <span className="sr-only">
                {isCurrent ? t("currentStep") : isComplete ? t("completed") : t("notStarted")}
              </span>
            </li>
          );
        })}
        </ol>
      </div>
      <div className="mt-7 h-1 w-full overflow-hidden rounded-full bg-[#e5ecea]">
        <div
          className="h-full rounded-full bg-[#006b63] transition-all"
          style={{ width: currentStep === 1 ? "50%" : "100%" }}
        />
      </div>
    </nav>
  );
}

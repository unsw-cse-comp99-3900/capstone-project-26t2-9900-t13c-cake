"use client";

import { useQuizState } from "@/contexts/QuizStateContext";
import { JurisdictionStep } from "./JurisdictionStep";
import { QuizProgress } from "./QuizProgress";

/** CAKE-3 — QuizWizard */
export function QuizWizard() {
  const { currentStep } = useQuizState();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="rounded-[2rem] bg-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Find remuneration guidance for your situation
          </h2>
        </div>

        <QuizProgress currentStep={currentStep} />

        <div className="mt-6">
          <JurisdictionStep />
        </div>
      </div>
    </div>
  );
}

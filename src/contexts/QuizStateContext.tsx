"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/** CAKE-3 — holds quiz answers across wizard steps */
export type QuizStep = 1 | 2 | 3;

export type QuizAnswers = {
  jurisdictions: string[];
  context: string | null;
  engagementLevel: string | null;
};

type QuizStateContextValue = {
  answers: QuizAnswers;
  currentStep: QuizStep;
  setCurrentStep: (step: QuizStep) => void;
  toggleJurisdiction: (jurisdiction: string) => void;
  clearJurisdictions: () => void;
};

const QuizStateContext = createContext<QuizStateContextValue | null>(null);

export function QuizStateProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<QuizStep>(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    jurisdictions: [],
    context: null,
    engagementLevel: null,
  });

  const value = useMemo<QuizStateContextValue>(
    () => ({
      answers,
      currentStep,
      setCurrentStep,
      toggleJurisdiction(jurisdiction) {
        setAnswers((previous) => {
          const isSelected = previous.jurisdictions.includes(jurisdiction);

          return {
            ...previous,
            jurisdictions: isSelected
              ? previous.jurisdictions.filter((item) => item !== jurisdiction)
              : [...previous.jurisdictions, jurisdiction],
          };
        });
      },
      clearJurisdictions() {
        setAnswers((previous) => ({ ...previous, jurisdictions: [] }));
      },
    }),
    [answers, currentStep],
  );

  return <QuizStateContext.Provider value={value}>{children}</QuizStateContext.Provider>;
}

export function useQuizState(): QuizStateContextValue {
  const context = useContext(QuizStateContext);
  if (!context) {
    throw new Error("useQuizState must be used within QuizStateProvider");
  }
  return context;
}

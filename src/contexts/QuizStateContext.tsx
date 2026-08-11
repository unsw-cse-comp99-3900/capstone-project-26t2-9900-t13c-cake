"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/** CAKE-3 - holds quiz answers across wizard steps */
export type QuizStep = 1 | 2;

export type ContextSelection = {
  context: string;
  subCategory: string | null;
  engagementLevels: string[];
};

export type QuizAnswers = {
  jurisdictions: string[];
  selections: ContextSelection[];
};

type QuizStateContextValue = {
  answers: QuizAnswers;
  currentStep: QuizStep;
  setCurrentStep: (step: QuizStep) => void;
  toggleJurisdiction: (jurisdiction: string) => void;
  clearJurisdictions: () => void;
  toggleContext: (context: string) => void;
  setSelectionSubCategory: (context: string, subCategory: string | null) => void;
  setSelectionEngagementLevels: (context: string, engagementLevels: string[]) => void;
  resetAnswers: () => void;
};

const initialAnswers: QuizAnswers = {
  jurisdictions: [],
  selections: [],
};

const QuizStateContext = createContext<QuizStateContextValue | null>(null);

export function QuizStateProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<QuizStep>(1);
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers);

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
            selections: [],
          };
        });
      },
      clearJurisdictions() {
        setAnswers((previous) => ({ ...previous, jurisdictions: [], selections: [] }));
      },
      toggleContext(context) {
        setAnswers((previous) => {
          const isSelected = previous.selections.some(
            (selection) => selection.context === context,
          );

          return {
            ...previous,
            selections: isSelected
              ? previous.selections.filter((selection) => selection.context !== context)
              : [
                  ...previous.selections,
                  {
                    context,
                    subCategory: null,
                    engagementLevels: [],
                  },
                ],
          };
        });
      },
      setSelectionSubCategory(context, subCategory) {
        setAnswers((previous) => ({
          ...previous,
          selections: previous.selections.map((selection) =>
            selection.context === context
              ? { ...selection, subCategory, engagementLevels: [] }
              : selection,
          ),
        }));
      },
      setSelectionEngagementLevels(context, engagementLevels) {
        setAnswers((previous) => ({
          ...previous,
          selections: previous.selections.map((selection) =>
            selection.context === context
              ? { ...selection, engagementLevels }
              : selection,
          ),
        }));
      },
      resetAnswers() {
        setAnswers(initialAnswers);
        setCurrentStep(1);
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

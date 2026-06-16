"use client";

import { createContext, useContext, type ReactNode } from "react";

/** CAKE-3 — holds quiz answers across wizard steps */
type QuizStateContextValue = Record<string, never>;

const QuizStateContext = createContext<QuizStateContextValue | null>(null);

export function QuizStateProvider({ children }: { children: ReactNode }) {
  return <QuizStateContext.Provider value={{}}>{children}</QuizStateContext.Provider>;
}

export function useQuizState(): QuizStateContextValue {
  const context = useContext(QuizStateContext);
  if (!context) {
    throw new Error("useQuizState must be used within QuizStateProvider");
  }
  return context;
}

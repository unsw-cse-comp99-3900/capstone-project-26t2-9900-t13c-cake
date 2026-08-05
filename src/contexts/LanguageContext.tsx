"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  dictionaries,
  type Language,
  type TranslationKey,
} from "@/i18n/translations";

type Replacements = Record<string, string | number>;
type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, replacements?: Replacements) => string;
};

const STORAGE_KEY = "cake-language";
const LanguageContext = createContext<LanguageContextValue | null>(null);

/** Provides UI language state and `t()` lookups for public and admin screens. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && stored in dictionaries) setLanguageState(stored as Language);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage(next) {
      setLanguageState(next);
      window.localStorage.setItem(STORAGE_KEY, next);
    },
    t(key, replacements = {}) {
      return Object.entries(replacements).reduce(
        (text, [name, replacement]) => text.replaceAll(`{${name}}`, String(replacement)),
        dictionaries[language][key],
      );
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** Hook for translated UI strings from LanguageProvider. */
export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used within LanguageProvider");
  return value;
}

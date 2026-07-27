"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { languageLabels, type Language } from "@/i18n/translations";

type LanguageSelectorProps = {
  variant?: "default" | "hero" | "questionnaire";
};

export function LanguageSelector({ variant = "default" }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const isHero = variant === "hero";
  const isQuestionnaire = variant === "questionnaire";

  return (
    <label
      className={[
        "relative flex items-center gap-2 text-sm font-semibold",
        isHero ? "text-teal-200" : isQuestionnaire ? "text-white/90" : "text-slate-700",
      ].join(" ")}
    >
      <span className={isQuestionnaire ? "sr-only" : undefined}>{t("language")}</span>
      {isQuestionnaire ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/85"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a13 13 0 0 1 0 18" />
          <path d="M12 3a13 13 0 0 0 0 18" />
        </svg>
      ) : null}
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className={[
          "min-h-10 border px-3 py-2 focus:outline-3 focus:outline-offset-2",
          isHero
            ? "appearance-none border-teal-100/85 bg-transparent pl-3 pr-9 text-white transition hover:border-teal-100 hover:bg-teal-50 hover:text-teal-900 focus:outline-white"
            : isQuestionnaire
              ? "appearance-none border-white/45 bg-transparent pl-10 pr-10 font-bold text-white transition hover:border-white/80 hover:bg-white/10 focus:outline-white"
              : "rounded-lg border-slate-300 bg-white text-slate-900 focus:outline-teal-700",
        ].join(" ")}
      >
        {Object.entries(languageLabels).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {isHero || isQuestionnaire ? (
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm",
            isHero ? "text-teal-200" : isQuestionnaire ? "text-white/85" : "text-teal-700",
          ].join(" ")}
        >
          ▾
        </span>
      ) : null}
    </label>
  );
}

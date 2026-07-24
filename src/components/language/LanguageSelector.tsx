"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { languageLabels, type Language } from "@/i18n/translations";

type LanguageSelectorProps = {
  variant?: "default" | "hero";
};

export function LanguageSelector({ variant = "default" }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const isHero = variant === "hero";

  return (
    <label
      className={[
        "relative flex items-center gap-2 text-sm font-semibold",
        isHero ? "text-teal-200" : "text-slate-700",
      ].join(" ")}
    >
      <span>{t("language")}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className={[
          "min-h-10 border px-3 py-2 focus:outline-3 focus:outline-offset-2",
          isHero
            ? "appearance-none border-teal-100/85 bg-transparent pl-3 pr-9 text-white transition hover:border-teal-100 hover:bg-teal-50 hover:text-teal-900 focus:outline-white"
            : "rounded-lg border-slate-300 bg-white text-slate-900 focus:outline-teal-700",
        ].join(" ")}
      >
        {Object.entries(languageLabels).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {isHero ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-teal-200"
        >
          ▾
        </span>
      ) : null}
    </label>
  );
}

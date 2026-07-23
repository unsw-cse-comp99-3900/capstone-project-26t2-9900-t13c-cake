"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { languageLabels, type Language } from "@/i18n/translations";

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
      <span>{t("language")}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-3 focus:outline-offset-2 focus:outline-teal-700"
      >
        {Object.entries(languageLabels).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </label>
  );
}

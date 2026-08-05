"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { languageLabels, type Language } from "@/i18n/translations";
import { AccessibilityMenu } from "@/components/accessibility/AccessibilityMenu";

type LanguageSelectorProps = {
  variant?: "default" | "hero" | "questionnaire";
};

const languages = Object.entries(languageLabels) as [Language, string][];

/** Language switcher (and accessibility entry) for public/admin chrome. */
export function LanguageSelector({ variant = "default" }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const isHero = variant === "hero";
  const isQuestionnaire = variant === "questionnaire";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(next: Language) {
    setLanguage(next);
    setOpen(false);
  }

  return (
    <div
      className={[
        "flex flex-wrap items-center justify-end gap-3",
        isHero ? "w-full flex-col items-stretch sm:w-auto sm:flex-row sm:items-center" : "",
      ].join(" ")}
    >
      <div
        ref={rootRef}
        className={[
          "relative flex items-center gap-2 text-sm font-semibold",
          isHero
            ? "w-full justify-end text-teal-200 sm:w-auto sm:justify-start"
            : isQuestionnaire
              ? "text-white/90"
              : "text-slate-700",
        ].join(" ")}
      >
        <span className={isQuestionnaire ? "sr-only" : undefined}>{t("language")}</span>
        <div className="relative">
        {isQuestionnaire ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 z-10 size-5 -translate-y-1/2 text-white/85"
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
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
          className={[
            "flex min-h-10 min-w-[10.5rem] items-center border px-3 py-2 text-left focus:outline-3 focus:outline-offset-2",
            isHero
              ? "border-teal-100/85 bg-transparent pr-9 text-white transition hover:border-teal-100 hover:bg-white/10 focus:outline-white"
              : isQuestionnaire
                ? "border-white/45 bg-transparent pl-10 pr-10 font-bold text-white transition hover:border-white/80 hover:bg-white/10 focus:outline-white"
                : "rounded-lg border-slate-300 bg-white pr-9 text-slate-900 focus:outline-teal-700",
          ].join(" ")}
        >
          <span className="truncate">{languageLabels[language]}</span>
        </button>
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm",
            isHero ? "text-teal-200" : isQuestionnaire ? "text-white/85" : "text-teal-700",
          ].join(" ")}
        >
          ▾
        </span>
        {open ? (
          <ul
            id={listId}
            role="listbox"
            aria-label={t("language")}
            className="absolute right-0 z-60 mt-1 max-h-72 min-w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-slate-900 shadow-lg"
          >
            {languages.map(([value, label]) => {
              const selected = value === language;
              return (
                <li key={value} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => choose(value)}
                    className={[
                      "block w-full px-3 py-2 text-left text-sm font-medium",
                      "hover:bg-teal-700 hover:text-white",
                      "focus:bg-teal-700 focus:text-white focus:outline-none",
                      selected ? "bg-teal-50 text-teal-950" : "bg-white text-slate-900",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
        </div>
      </div>
      <AccessibilityMenu variant={variant} />
    </div>
  );
}

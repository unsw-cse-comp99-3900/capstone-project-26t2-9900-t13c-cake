"use client";

import Image from "next/image";
import { JURISDICTIONS } from "@/lib/constants/quizOptions";
import { useQuizState } from "@/contexts/QuizStateContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateOption } from "@/i18n/optionTranslations";

/** CAKE-3 — JurisdictionStep */
export function JurisdictionStep() {
  const { answers, toggleJurisdiction, clearJurisdictions, setCurrentStep } = useQuizState();
  const { t, language } = useLanguage();
  const hasSelection = answers.jurisdictions.length > 0;

  return (
    <section
      aria-labelledby="jurisdiction-heading"
      className="mt-8 grid gap-6 md:grid-cols-[minmax(210px,0.36fr)_minmax(0,1fr)] md:items-start lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-12"
    >
      <div className="relative overflow-visible pb-2 md:sticky md:top-8 md:min-h-[520px] md:pb-48">
        <p className="relative z-10 text-xs font-bold uppercase tracking-[0.22em] text-[#006b63]">
          Step 1
        </p>
        <h2
          id="jurisdiction-heading"
          className="relative z-10 mt-3 max-w-2xl font-[Georgia,serif] text-3xl font-normal leading-tight tracking-tight text-[#051b1a] sm:text-4xl md:max-w-[230px] md:text-[2.35rem] lg:max-w-[285px] lg:text-[2.7rem] xl:mt-5 xl:max-w-[320px] xl:text-[2.82rem]"
        >
          Select the locations covered by your project
        </h2>
        <div className="relative z-10 mt-5 h-0.5 w-12 bg-[#006b63] md:mt-7 md:w-14" />
        <p className="relative z-10 mt-5 max-w-2xl text-base leading-7 text-slate-600 md:mt-7 md:max-w-[250px] md:text-sm md:leading-7 lg:max-w-[285px] lg:text-base lg:leading-8">
          You can choose more than one jurisdiction. Select National if the
          project covers all of Australia.
        </p>
        <Image
          src="/decor/questionnaire-leaves.svg"
          alt=""
          aria-hidden="true"
          width={520}
          height={340}
          className="pointer-events-none absolute bottom-[-42px] left-[-185px] z-0 hidden w-[620px] opacity-64 md:block lg:bottom-[-52px] lg:left-[-220px] lg:w-[760px]"
        />
      </div>

      <div className="rounded-[24px] border border-[#a9d3cc] bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] sm:p-7 lg:p-10">
        <div>
          <h3 className="font-[Georgia,serif] text-3xl font-normal leading-tight tracking-tight text-[#050817] lg:text-4xl">
            {t("jurisdictionHeading")}
          </h3>
          <p id="jurisdiction-help" className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 lg:text-base">
          {t("jurisdictionHelp")}
          </p>
        </div>

        <fieldset className="mt-7" aria-describedby="jurisdiction-help">
          <legend className="sr-only">{t("selectJurisdictions")}</legend>
          <div className="grid gap-4 md:grid-cols-2">
            {JURISDICTIONS.map((jurisdiction) => {
              const optionId = `jurisdiction-${jurisdiction.value.toLowerCase()}`;
              const isSelected = answers.jurisdictions.includes(jurisdiction.value);

              return (
                <label
                  key={jurisdiction.value}
                  htmlFor={optionId}
                  className={[
                    "group cursor-pointer rounded-[8px] border px-4 py-4 transition lg:px-5 lg:py-5",
                    "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-teal-700",
                    isSelected
                      ? "border-[#006b63] bg-[#e8f7f3]"
                      : "border-[#dce6e4] bg-white hover:border-[#b8d9d4] hover:bg-[#fbfefd]",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-4">
                    <input
                      id={optionId}
                      type="checkbox"
                      value={jurisdiction.value}
                      checked={isSelected}
                      onChange={() => toggleJurisdiction(jurisdiction.value)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={[
                        "flex size-5 shrink-0 items-center justify-center rounded-[4px] border text-sm font-bold transition",
                        isSelected
                          ? "border-[#006b63] bg-[#006b63] text-white"
                          : "border-[#cfd9d7] bg-white text-transparent group-hover:border-[#b8d9d4]",
                      ].join(" ")}
                    >
                      ✓
                    </span>
                    <span className="min-w-0 text-sm font-bold text-slate-950 lg:text-base">
                      {translateOption(language, jurisdiction.label)}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-8 flex flex-col gap-4 border-t border-[#dce6e4] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-3 text-base leading-7 text-slate-600" aria-live="polite">
            {hasSelection ? (
              <span
                aria-hidden="true"
                className="flex size-7 items-center justify-center rounded-full border border-[#006b63] text-sm font-bold text-[#006b63]"
              >
                ✓
              </span>
            ) : null}
            {hasSelection
              ? t("selectedJurisdictions", { count: answers.jurisdictions.length })
              : t("chooseJurisdiction")}
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={clearJurisdictions}
              disabled={!hasSelection}
              className="min-h-12 rounded-[14px] border border-[#cfd9d7] px-6 py-3 text-sm font-bold text-slate-600 transition hover:border-[#006b63] hover:bg-[#f3fbf8] hover:text-[#003f3b] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
            >
              {t("clearSelection")}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              disabled={!hasSelection}
              className="min-h-12 rounded-[14px] border border-[#006b63] px-7 py-3 text-sm font-bold text-[#003f3b] transition hover:bg-[#006b63] hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:border-[#cfd9d7] disabled:bg-[#e1e9eb] disabled:text-slate-500 disabled:hover:text-slate-500"
            >
              {t("continue")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { AnonymousFeedbackForm } from "./AnonymousFeedbackForm";
import { LanguageSelector } from "@/components/language/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

/** CAKE-13 — public anonymous feedback page. */
export function FeedbackPage() {
  const { t } = useLanguage();
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-white text-slate-900 outline-none">
      <div className="bg-[#004c45] text-white shadow-[0_10px_28px_rgba(0,36,33,0.18)]">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-[75px]">
          <Link
            href="/"
            className="font-[Georgia,serif] text-2xl font-normal text-white transition hover:text-teal-100 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-3xl"
          >
            {t("toolTitle")}
          </Link>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-4">
            <LanguageSelector variant="questionnaire" />
            <Link
              href="/privacy"
              className="hidden min-h-11 items-center justify-center border border-white/45 px-4 py-2 text-sm font-bold text-white transition hover:border-white/80 hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white sm:inline-flex"
            >
              {t("privacyNotice")}
            </Link>
          </div>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1500px] px-5 py-10 sm:px-8 lg:px-[75px] lg:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#006b63]">{t("feedbackLabel")}</p>
          <h1 className="mt-3 font-[Georgia,serif] text-4xl font-normal leading-tight tracking-tight text-[#051b1a] sm:text-5xl">
            {t("feedbackTitle")}
          </h1>
          <div className="mx-auto mt-6 h-0.5 w-14 bg-[#006b63]" />
          <p className="mt-6 text-base leading-8 text-slate-600">
            {t("feedbackIntro")}
          </p>
          <div className="mt-8 rounded-[10px] border border-[#a9d3cc] bg-[#edf8f5] px-4 py-4 text-left text-sm leading-6 text-slate-700">
            {t("surveyIntro")}
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-3xl">
          <AnonymousFeedbackForm />
        </div>
      </section>
    </main>
  );
}

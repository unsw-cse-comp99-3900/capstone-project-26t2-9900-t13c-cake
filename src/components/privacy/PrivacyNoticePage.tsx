"use client";

import Link from "next/link";
import { LanguageSelector } from "@/components/language/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

export function PrivacyNoticePage() {
  const { t } = useLanguage();
  const dataItems = [
    { title: t("privacyAnswersTitle"), description: t("privacyAnswersText") },
    { title: t("privacyEvidenceTitle"), description: t("privacyEvidenceText") },
    { title: t("privacyFeedbackTitle"), description: t("privacyFeedbackText") },
    { title: t("privacyAdminTitle"), description: t("privacyAdminText") },
  ];
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-slate-50 text-slate-900 outline-none">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="font-bold text-teal-800 transition hover:text-teal-950 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          >
            {t("toolTitle")}
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <LanguageSelector />
            <Link
              href="/questionnaire"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {t("startQuestionnaire")}
            </Link>
          </div>
        </div>
      </div>

      <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-800">{t("privacyLabel")}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {t("privacyTitle")}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {t("privacyIntro")}
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {dataItems.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">{item.title}</h2>
              <p className="mt-2 text-base leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>

        <aside className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-base leading-7 text-amber-950">
          <strong>{t("important")}</strong> {t("privacyWarning")}
        </aside>

        <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5">
          <h2 className="text-xl font-bold text-teal-950">{t("privacyFeedbackTitle")}</h2>
          <p className="mt-2 text-base leading-7 text-slate-700">
            {t("feedbackOptional")}
          </p>
          <Link
            href="/feedback"
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {t("openFeedback")}
          </Link>
        </div>
      </section>
    </main>
  );
}

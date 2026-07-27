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
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-white text-slate-900 outline-none"
    >
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
              href="/questionnaire"
              className="hidden min-h-11 items-center justify-center border border-white/45 px-4 py-2 text-sm font-bold text-white transition hover:border-white/80 hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white sm:inline-flex"
            >
              {t("startQuestionnaire")}
            </Link>
          </div>
        </div>
      </div>

      <section className="mx-auto grid w-full max-w-[1500px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(260px,0.34fr)_minmax(0,1fr)] lg:px-[75px] lg:py-14 xl:gap-12">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#006b63]">
            {t("privacyLabel")}
          </p>
          <h1 className="mt-3 max-w-3xl font-[Georgia,serif] text-4xl font-normal leading-tight tracking-tight text-[#051b1a] sm:text-5xl lg:max-w-[360px]">
            {t("privacyTitle")}
          </h1>
          <div className="mt-6 h-0.5 w-14 bg-[#006b63]" />
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 lg:max-w-[330px]">
            {t("privacyIntro")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/questionnaire"
              className="inline-flex min-h-11 items-center justify-center rounded-[4px] border border-[#006b63] bg-[#006b63] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#00524c] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {t("startQuestionnaire")}
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-[4px] border border-[#9fbab7] bg-white px-5 py-2 text-sm font-bold text-[#003f3b] transition hover:border-[#006b63] hover:bg-[#f3fbf8] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {t("backHome")}
            </Link>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#a9d3cc] bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] sm:p-7 lg:p-10">
          <div className="grid gap-4 md:grid-cols-2">
            {dataItems.map((item, index) => (
              <article
                key={item.title}
                className="rounded-[8px] border border-[#dce6e4] bg-[#f8faf9] p-5 transition hover:border-[#b8d9d4] hover:bg-[#fbfefd]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#006b63]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-3 text-xl font-bold text-[#051b1a]">{item.title}</h2>
                <p className="mt-3 text-base leading-7 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>

          <aside className="mt-5 rounded-[8px] border border-amber-200 bg-[#fff8e8] p-5 text-base leading-7 text-amber-950">
            <strong>{t("important")}</strong> {t("privacyWarning")}
          </aside>

          <div className="mt-5 border border-[#a9d3cc] bg-[#edf8f5] px-5 py-5">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div>
                <h2 className="text-2xl font-bold text-[#051b1a]">{t("privacyFeedbackTitle")}</h2>
                <p className="mt-2 text-base leading-7 text-slate-700">
                  {t("feedbackOptional")}
                </p>
              </div>
              <Link
                href="/feedback"
                className="inline-flex min-h-11 items-center justify-center rounded-[4px] border border-[#006b63] px-5 py-2 text-sm font-bold text-[#003f3b] transition hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                {t("openFeedback")}
                <span aria-hidden="true" className="ml-3 text-lg leading-none">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { FeedbackShell } from "./FeedbackShell";
import { useLanguage } from "@/contexts/LanguageContext";

export function FeedbackThankYouPage() {
  const { t } = useLanguage();

  return (
    <FeedbackShell>
      <section className="mx-auto flex w-full max-w-3xl items-center px-4 py-12 sm:min-h-[calc(100vh-4.5rem)] sm:px-6 lg:px-8">
        <div
          role="status"
          className="w-full rounded-2xl border border-teal-200 bg-white p-6 text-center shadow-sm sm:p-10"
        >
          <p className="text-sm font-bold uppercase tracking-wide text-teal-800">
            {t("feedbackSavedLabel")}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {t("feedbackThankYouTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
            {t("feedbackThankYouText")}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-teal-700 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {t("returnHome")}
            </Link>
            <Link
              href="/feedback"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-teal-700 bg-white px-6 py-3 text-base font-bold text-teal-800 transition hover:bg-teal-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {t("submitMoreFeedback")}
            </Link>
          </div>
        </div>
      </section>
    </FeedbackShell>
  );
}

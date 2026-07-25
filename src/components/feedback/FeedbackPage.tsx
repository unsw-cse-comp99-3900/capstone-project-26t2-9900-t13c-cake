"use client";

import { AnonymousFeedbackForm } from "./AnonymousFeedbackForm";
import { FeedbackShell } from "./FeedbackShell";
import { useLanguage } from "@/contexts/LanguageContext";

export function FeedbackPage() {
  const { t } = useLanguage();
  return (
    <FeedbackShell>
      <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-800">{t("feedbackLabel")}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {t("feedbackTitle")}
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {t("feedbackIntro")}
          </p>
        </div>

        <AnonymousFeedbackForm />
      </section>
    </FeedbackShell>
  );
}

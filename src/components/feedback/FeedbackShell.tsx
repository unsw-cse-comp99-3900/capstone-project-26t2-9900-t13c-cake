"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LanguageSelector } from "@/components/language/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

type FeedbackShellProps = {
  children: ReactNode;
};

export function FeedbackShell({ children }: FeedbackShellProps) {
  const { t } = useLanguage();

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-slate-50 text-slate-900 outline-none"
    >
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
              href="/privacy"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {t("privacyNotice")}
            </Link>
          </div>
        </div>
      </div>

      {children}
    </main>
  );
}

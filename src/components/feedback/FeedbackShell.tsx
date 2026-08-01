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
              href="/privacy"
              className="hidden min-h-11 items-center justify-center border border-white/45 px-4 py-2 text-sm font-bold text-white transition hover:border-white/80 hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white sm:inline-flex"
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

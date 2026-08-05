"use client";

import Link from "next/link";
import { FeedbackShell } from "./FeedbackShell";
import { useLanguage } from "@/contexts/LanguageContext";

/** CAKE-13 — confirmation screen after anonymous feedback is saved. */
export function FeedbackThankYouPage() {
  const { t } = useLanguage();

  return (
    <FeedbackShell>
      <section className="relative isolate flex min-h-[calc(100vh-92px)] items-center justify-center overflow-hidden bg-[#fbfcfa] px-5 py-12 sm:px-8 lg:px-[75px]">
        <div className="pointer-events-none absolute -left-24 bottom-[-7rem] size-72 rounded-full bg-[#e7f5f1]" />
        <div className="pointer-events-none absolute -right-28 top-14 size-[26rem] rounded-full bg-[#e7f5f1]/55" />
        <svg
          aria-hidden="true"
          viewBox="-80 20 520 320"
          className="pointer-events-none absolute bottom-4 left-[-2.5rem] hidden w-[27rem] text-[#9ecfca] opacity-45 sm:block"
          fill="none"
        >
          <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 292C86 262 153 224 210 178C265 134 326 102 402 84" />
            <path d="M78 261C39 247 15 221 7 183C51 188 82 211 100 252" />
            <path d="M77 260C51 232 33 207 22 188" />
            <path d="M134 230C89 218 60 188 48 141C99 150 134 179 153 222" />
            <path d="M134 230C99 196 75 167 59 146" />
            <path d="M188 190C147 164 130 124 138 72C184 101 207 139 202 184" />
            <path d="M188 190C166 147 152 111 142 78" />
            <path d="M238 154C248 109 280 74 335 49C337 103 307 140 248 164" />
            <path d="M238 154C276 115 306 83 328 54" />
            <path d="M307 117C333 79 377 58 440 56C424 111 382 137 317 127" />
            <path d="M307 117C356 94 397 75 431 60" />
            <path d="M172 209C222 214 263 235 295 272C238 278 194 260 162 221" />
            <path d="M172 209C217 234 255 253 288 268" />
          </g>
        </svg>
        <div
          role="status"
          className="relative z-10 w-full max-w-4xl rounded-[26px] border border-[#a9d3cc] bg-white/95 px-6 py-10 text-center shadow-[0_14px_48px_rgba(15,23,42,0.10)] sm:px-10 sm:py-14 lg:px-16"
        >
          <div className="mx-auto grid size-24 place-items-center rounded-full bg-[#e8f7f3]">
            <span className="grid size-16 place-items-center rounded-full bg-[#006b63] text-white">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 12 4.5 4.5L19 7" />
              </svg>
            </span>
          </div>
          <p className="mt-9 text-sm font-extrabold uppercase tracking-[0.28em] text-[#006b63]">
            {t("feedbackSavedLabel")}
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl font-[Georgia,serif] text-4xl font-normal leading-tight tracking-tight text-[#051b1a] sm:text-5xl lg:text-[3.45rem]">
            {t("feedbackThankYouTitle")}
          </h1>
          <div className="mx-auto mt-6 h-0.5 w-14 bg-[#006b63]" />
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            {t("feedbackThankYouText")}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-14 items-center justify-center rounded-[4px] border border-[#006b63] bg-[#006b63] px-8 py-3 text-base font-bold text-white shadow-sm transition hover:bg-[#00524c] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {t("returnHome")}
            </Link>
            <Link
              href="/feedback"
              className="inline-flex min-h-14 items-center justify-center rounded-[4px] border border-[#006b63] bg-white px-8 py-3 text-base font-bold text-[#004c45] transition hover:bg-[#f3fbf8] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {t("submitMoreFeedback")}
            </Link>
          </div>
        </div>
      </section>
    </FeedbackShell>
  );
}

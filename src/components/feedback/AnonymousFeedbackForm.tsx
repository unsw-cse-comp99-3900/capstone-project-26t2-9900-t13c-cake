"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

type FormStatus =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success" }
  | { type: "error"; message: string };

const toolAreas: Array<{ value: string; label: TranslationKey }> = [
  { value: "Landing page", label: "areaLanding" },
  { value: "Questionnaire", label: "areaQuestionnaire" },
  { value: "Results", label: "areaResults" },
  { value: "Privacy information", label: "areaPrivacy" },
  { value: "General experience", label: "areaGeneral" },
];

export function AnonymousFeedbackForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });
  const [rating, setRating] = useState("");
  const [partOfTool, setPartOfTool] = useState("General experience");
  const [workedWell, setWorkedWell] = useState("");
  const [improvement, setImprovement] = useState("");
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "submitting" });

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: Number(rating),
          partOfTool,
          workedWell,
          improvement,
          consentConfirmed,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? t("feedbackError"));
      }

      setRating("");
      setPartOfTool("General experience");
      setWorkedWell("");
      setImprovement("");
      setConsentConfirmed(false);
      setStatus({ type: "success" });
      router.push("/feedback/thank-you");
      window.setTimeout(() => {
        if (window.location.pathname !== "/feedback/thank-you") {
          window.location.assign("/feedback/thank-you");
        }
      }, 150);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : t("feedbackError"),
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={status.type === "submitting"}
      className="rounded-[24px] border border-[#a9d3cc] bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] sm:p-7 lg:p-10"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#051b1a]">{t("surveyTitle")}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {t("surveyIntro")}
        </p>
      </div>

      <fieldset className="mt-6" aria-describedby="usefulness-help">
        <legend className="text-base font-bold text-slate-900">{t("usefulness")}</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className={`flex min-h-14 cursor-pointer items-center justify-center rounded-[8px] border px-4 py-3 text-base font-bold transition focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-teal-700 ${
                rating === String(value)
                  ? "border-[#006b63] bg-[#e8f7f3] text-[#003f3b]"
                  : "border-[#dce6e4] bg-white text-slate-700 hover:border-[#e8b49b] hover:bg-[#fff7f2]"
              }`}
            >
              <input
                required
                type="radio"
                name="rating"
                value={value}
                checked={rating === String(value)}
                onChange={(event) => setRating(event.target.value)}
                className="sr-only"
              />
              {value}
            </label>
          ))}
        </div>
        <p id="usefulness-help" className="mt-2 text-sm text-slate-700">
          {t("usefulnessHelp")}
        </p>
      </fieldset>

      <label htmlFor="feedback-worked-well" className="mt-5 block">
        <span className="text-base font-bold text-slate-900">{t("commentingOn")}</span>
        <div className="relative mt-2">
          <select
            value={partOfTool}
            onChange={(event) => setPartOfTool(event.target.value)}
            className="min-h-12 w-full appearance-none rounded-[4px] border border-[#8f9aa3] bg-white px-4 py-2 pr-10 text-base text-slate-900 shadow-[inset_0_1px_1px_rgba(15,23,42,0.04)] focus:outline-3 focus:outline-offset-2 focus:outline-teal-700"
          >
            {toolAreas.map((area) => (
              <option key={area.value} value={area.value}>
                {t(area.label)}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 8 5 5 5-5" />
          </svg>
        </div>
      </label>

      <label className="mt-5 block">
        <span className="text-base font-bold text-slate-900">{t("workedWell")}</span>
        <textarea
          id="feedback-worked-well"
          aria-describedby="feedback-worked-well-help"
          value={workedWell}
          onChange={(event) => setWorkedWell(event.target.value)}
          maxLength={800}
          rows={4}
          className="mt-2 w-full rounded-[8px] border border-[#d6dcdd] bg-[#f8faf9] px-4 py-3 text-base leading-7 text-slate-900 shadow-sm transition hover:border-[#b8d9d4] focus:outline-3 focus:outline-offset-2 focus:outline-teal-700"
        />
        <span id="feedback-worked-well-help" className="mt-1 block text-sm leading-6 text-slate-700">
          {t("workedWellHelp")}
        </span>
      </label>

      <label htmlFor="feedback-improvement" className="mt-5 block">
        <span className="text-base font-bold text-slate-900">{t("improvement")}</span>
        <textarea
          id="feedback-improvement"
          aria-describedby="feedback-improvement-help"
          value={improvement}
          onChange={(event) => setImprovement(event.target.value)}
          maxLength={800}
          rows={4}
          className="mt-2 w-full rounded-[8px] border border-[#d6dcdd] bg-[#f8faf9] px-4 py-3 text-base leading-7 text-slate-900 shadow-sm transition hover:border-[#b8d9d4] focus:outline-3 focus:outline-offset-2 focus:outline-teal-700"
        />
        <span id="feedback-improvement-help" className="mt-1 block text-sm leading-6 text-slate-700">
          {t("improvementHelp")}
        </span>
      </label>

      <label className="mt-5 flex gap-3 rounded-[8px] border border-[#dce6e4] bg-[#f8faf9] p-4 text-sm leading-6 text-slate-700 transition hover:border-[#b8d9d4]">
        <input
          required
          type="checkbox"
          checked={consentConfirmed}
          onChange={(event) => setConsentConfirmed(event.target.checked)}
          className="mt-1 size-4 shrink-0 accent-teal-700"
        />
        <span>
          {t("feedbackConsent")}
        </span>
      </label>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status.type === "submitting"}
          className="inline-flex min-h-12 items-center justify-center rounded-[4px] border border-[#006b63] bg-[#006b63] px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-[#00524c] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-400 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          {status.type === "submitting" ? t("submitting") : t("submitFeedback")}
        </button>
        {status.type === "error" && (
          <p role="alert" className="rounded-[8px] border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900">
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}

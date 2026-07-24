"use client";

import { FormEvent, useState } from "react";
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
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">{t("surveyTitle")}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {t("surveyIntro")}
        </p>
      </div>

      <fieldset className="mt-6" aria-describedby="usefulness-help">
        <legend className="text-base font-bold text-slate-900">{t("usefulness")}</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold transition focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-teal-700 ${
                rating === String(value)
                  ? "border-teal-700 bg-teal-50 text-teal-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-teal-300"
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
        <select
          value={partOfTool}
          onChange={(event) => setPartOfTool(event.target.value)}
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
        >
          {toolAreas.map((area) => (
            <option key={area.value} value={area.value}>
              {t(area.label)}
            </option>
          ))}
        </select>
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
          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-base text-slate-900 shadow-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
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
          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-base text-slate-900 shadow-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
        />
        <span id="feedback-improvement-help" className="mt-1 block text-sm leading-6 text-slate-700">
          {t("improvementHelp")}
        </span>
      </label>

      <label className="mt-5 flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
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
          className="inline-flex min-h-12 items-center justify-center rounded-lg bg-teal-700 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          {status.type === "submitting" ? t("submitting") : t("submitFeedback")}
        </button>
        {status.type === "success" && (
          <p role="status" className="text-sm font-semibold text-teal-800">
            {t("feedbackSuccess")}
          </p>
        )}
        {status.type === "error" && (
          <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900">
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}

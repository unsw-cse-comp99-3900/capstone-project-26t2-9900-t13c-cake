"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LanguageSelector } from "@/components/language/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

const citation =
  "Johnston, D., Nguyen, L., Liu, Y., Wei, X., Dai, J., Li, J., Zhang, Z., & Yang, Z. (2026). Consumer Rep Remuneration Tool [Web application]. i2i, UNSW Population Health and UNSW COMP9900/3900 Team T13C.";

/** CAKE-1 — public landing page with overview, citation, and questionnaire CTA. */
export function LandingPage() {
  const { t } = useLanguage();
  const [citationStatus, setCitationStatus] = useState<"idle" | "copied" | "failed">("idle");
  const citationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const featurePanels = [
    {
      title: t("whyTitle").replace(" this tool?", " it"),
      summary: t("whyDescription"),
      details: t("reason1Description"),
    },
    {
      title: t("problemsTitle"),
      summary: t("problem1"),
      details: t("problem2"),
    },
    {
      title: t("valueTitle"),
      summary: t("value1"),
      details: t("value2"),
    },
    {
      title: t("howTitle"),
      summary: t("howDescription"),
      details: t("step1Description"),
    },
  ];

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0 });
    }

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;

      if (citationTimer.current) {
        clearTimeout(citationTimer.current);
      }
    };
  }, []);

  async function copyCitation() {
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    try {
      await navigator.clipboard.writeText(citation);
      setCitationStatus("copied");
    } catch {
      setCitationStatus("failed");
    }

    if (citationTimer.current) {
      clearTimeout(citationTimer.current);
    }
    citationTimer.current = setTimeout(() => setCitationStatus("idle"), 1800);
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen overflow-hidden bg-white text-slate-900 outline-none"
    >
      <section className="relative isolate flex min-h-[520px] flex-col border-b border-teal-600 bg-[#115e59] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(153,246,228,0.22),_transparent_38%),linear-gradient(180deg,_rgba(15,118,110,0.08),_rgba(19,78,74,0.26))]"
        />
        <div className="relative z-20 mx-auto w-full max-w-5xl px-4 pt-4 sm:absolute sm:right-6 sm:top-4 sm:w-auto sm:max-w-none sm:px-0 sm:pt-0 lg:right-8">
          <LanguageSelector variant="hero" />
        </div>
        <div
          aria-hidden="true"
          className="absolute left-8 top-7 -z-10 hidden h-[390px] w-[420px] -rotate-12 opacity-20 lg:block"
        >
          <span className="absolute inset-x-2 top-0 h-[360px] border border-teal-100/25" />
          <span className="absolute inset-x-8 top-5 h-[360px] border border-teal-100/25" />
          <span className="absolute inset-x-14 top-10 h-[360px] border border-teal-100/25" />
          <span className="absolute left-28 top-40 h-px w-28 bg-teal-100/24" />
          <span className="absolute left-28 top-52 h-px w-36 bg-teal-100/18" />
          <span className="absolute left-28 top-64 h-px w-48 bg-teal-100/14" />
          <span className="absolute left-28 top-80 h-px w-52 bg-teal-100/20" />
          <span className="absolute left-28 top-96 h-px w-64 bg-teal-100/16" />
          <span className="absolute left-28 top-112 h-px w-44 bg-teal-100/14" />
        </div>
        <div
          aria-hidden="true"
          className="absolute right-8 top-12 -z-10 hidden h-[380px] w-[430px] opacity-25 lg:block"
        >
          <span className="absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(125,219,207,0.34)_1px,transparent_1px)] [background-size:18px_18px]" />
          <span className="absolute bottom-10 right-12 h-36 w-3 bg-teal-100/12" />
          <span className="absolute bottom-10 right-36 h-28 w-3 bg-teal-100/12" />
          <span className="absolute bottom-10 right-60 h-48 w-3 bg-teal-100/12" />
          <span className="absolute bottom-10 right-84 h-24 w-3 bg-teal-100/12" />
          <span className="absolute bottom-10 right-108 h-32 w-3 bg-teal-100/12" />
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 pb-10 pt-8 text-center sm:px-6 sm:pt-20 lg:px-8">
          <p className="landing-rise text-sm font-semibold uppercase tracking-[0.28em] text-teal-200">
            {t("landingEyebrow")}
          </p>
          <h1 className="landing-rise landing-rise-delay-1 mt-5 max-w-4xl font-[Georgia,serif] text-5xl font-normal leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t("toolTitle")}
          </h1>
          <p className="landing-rise landing-rise-delay-2 mt-5 max-w-2xl text-lg leading-8 text-slate-100">
            {t("homeSubtitle")}
          </p>

          <div className="landing-rise landing-rise-delay-3 mt-9 flex w-full max-w-[465px] flex-col items-center gap-5">
            <Link
              href="/questionnaire"
              className="group inline-flex min-h-16 w-full items-center justify-center border border-teal-100/85 px-8 py-4 text-lg font-bold text-white transition hover:border-teal-100 hover:bg-teal-50 hover:text-teal-900 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <span className="flex-1 text-center">{t("startQuestionnaire")}</span>
              <span
                aria-hidden="true"
                className="text-3xl font-normal leading-none transition-transform group-hover:translate-x-1"
              >
                &rarr;
              </span>
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-3 text-base font-medium text-teal-200 transition hover:text-white focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {t("howTitle")}
              <span aria-hidden="true">&darr;</span>
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="overview-heading"
        id="how-it-works"
        className="border-b border-slate-200 bg-white"
      >
        <div className="mx-auto w-full max-w-7xl px-6 pb-8 pt-12 text-center sm:px-8 sm:pt-14">
          <p className="landing-rise text-sm font-bold text-slate-700">
            {t("evidencePlanning")}
          </p>
          <h2
            id="overview-heading"
            className="landing-rise landing-rise-delay-1 mt-4 font-[Georgia,serif] text-4xl font-normal leading-tight text-teal-900 sm:text-5xl"
          >
            {t("supportFairPlanning")}
          </h2>
          <p className="landing-rise landing-rise-delay-2 mx-auto mt-5 max-w-4xl text-lg leading-8 text-slate-600">
            {t("whyDescription")}
          </p>
          <div className="landing-line landing-rise-delay-3 mt-8 h-px w-full bg-slate-200" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl md:grid-cols-2">
          {featurePanels.map((panel, index) => (
            <article
              key={panel.title}
              className={[
                "landing-rise group min-h-44 border-slate-200 px-6 py-9 transition hover:bg-[#f6faf8] sm:px-8",
                index === 0 ? "landing-rise-delay-3" : "",
                index === 1 ? "landing-rise-delay-4" : "",
                index === 2 ? "landing-rise-delay-5" : "",
                index === 3 ? "landing-rise-delay-6" : "",
                index % 2 === 0 ? "md:border-r" : "",
                index < 2 ? "border-b" : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-6">
                <h3 className="text-xl font-bold text-teal-950 transition group-hover:text-[#c65f46]">
                  {panel.title}
                </h3>
                <span
                  aria-hidden="true"
                  className="text-2xl leading-none text-teal-800 transition group-hover:rotate-45 group-hover:text-[#c65f46]"
                >
                  +
                </span>
              </div>
              <div className="mt-5 h-px w-full bg-transparent transition group-hover:bg-[#c65f46]" />
              <p className="mt-4 text-base leading-7 text-slate-600">
                {panel.summary}
              </p>
              <p className="max-h-0 overflow-hidden pt-0 text-base leading-7 text-slate-600 opacity-0 transition-all duration-300 group-hover:max-h-24 group-hover:pt-2 group-hover:opacity-100">
                {panel.details}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-b border-teal-100 bg-teal-50">
        <div className="mx-auto grid w-full max-w-7xl gap-x-6 gap-y-5 px-6 py-7 sm:px-8 lg:grid-cols-[1.25fr_1.35fr_1.1fr_1.1fr_minmax(150px,0.7fr)] lg:items-center">
          <div>
            <h2 className="whitespace-nowrap font-[Georgia,serif] text-2xl text-teal-950">
              {t("contactSupport")}
            </h2>
            <p className="mt-2 text-base text-slate-600">{t("hereToHelp")}</p>
          </div>
          <div className="border-slate-400/50 lg:border-l lg:pl-6">
            <p className="text-sm text-slate-700">{t("email")}</p>
            <a
              href="mailto:deborah.johnston@unsw.edu.au"
              className="mt-2 block whitespace-nowrap text-sm font-semibold text-teal-800 transition hover:text-teal-950"
            >
              deborah.johnston@unsw.edu.au
            </a>
          </div>
          <div className="border-slate-400/50 lg:border-l lg:pl-6">
            <p className="text-sm text-slate-700">{t("phone")}</p>
            <a
              href="tel:+610290659414"
              className="mt-2 block text-sm font-semibold text-teal-800 transition hover:text-teal-950"
            >
              +61 (02) 9065 9414
            </a>
          </div>
          <div className="border-slate-400/50 lg:border-l lg:pl-6">
            <p className="text-sm text-slate-700">{t("cite")}</p>
            <button
              type="button"
              onClick={copyCitation}
              className="relative mt-2 inline-flex items-center gap-5 text-left text-sm font-semibold leading-tight text-teal-800 transition hover:text-teal-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
            >
              <span className="whitespace-nowrap">{t("citeThisTool")}</span>
              <span aria-hidden="true">&rarr;</span>
              {citationStatus !== "idle" ? (
                <span
                  role="status"
                  className="absolute left-0 top-full z-10 mt-2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white shadow-lg"
                >
                  {citationStatus === "copied" ? t("copied") : t("copyFailed")}
                </span>
              ) : null}
            </button>
          </div>
          <Link
            href="/feedback"
            className="inline-flex min-h-16 items-center justify-between gap-2 border border-teal-800 px-4 py-3 text-teal-900 transition hover:bg-teal-900 hover:text-white focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
          >
            <span className="font-[Georgia,serif] text-xl leading-tight">{t("feedbackLabel")}</span>
            <span
              aria-hidden="true"
              className="text-lg leading-none"
            >
              ↗
            </span>
          </Link>
        </div>
      </section>

      <footer className="bg-teal-950 text-teal-100/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6 text-sm sm:px-8 md:flex-row md:items-center md:justify-center md:gap-8">
          <p>{t("copyright")}</p>
          <span aria-hidden="true" className="hidden h-5 w-px bg-slate-700 md:block" />
          <Link href="/questionnaire" className="transition hover:text-white">
            {t("startQuestionnaire")}
          </Link>
          <span aria-hidden="true" className="hidden h-5 w-px bg-slate-700 md:block" />
          <Link href="/privacy" className="transition hover:text-white">
            {t("privacyLabel").replace(" and ", " & ")}
          </Link>
          <span aria-hidden="true" className="hidden h-5 w-px bg-slate-700 md:block" />
          <Link href="/admin" className="transition hover:text-white">
            {t("administratorCentre")}
          </Link>
        </div>
      </footer>
    </main>
  );
}

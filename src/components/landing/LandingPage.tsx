"use client";

import Link from "next/link";
import { CitationCopyButton } from "./CitationCopyButton";
import { LanguageSelector } from "@/components/language/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

const citation =
  "Johnston, D., Nguyen, L., Liu, Y., Wei, X., Dai, J., Li, J., Zhang, Z., & Yang, Z. (2026). Consumer Rep Remuneration Tool [Web application]. i2i, UNSW Population Health and UNSW COMP9900/3900 Team T13C.";

export function LandingPage() {
  const { t } = useLanguage();
  const instructions = [
    { title: t("step1Title"), description: t("step1Description") },
    { title: t("step2Title"), description: t("step2Description") },
    { title: t("step3Title"), description: t("step3Description") },
  ];
  const reasons = [
    { title: t("reason1Title"), description: t("reason1Description") },
    { title: t("reason2Title"), description: t("reason2Description") },
    { title: t("reason3Title"), description: t("reason3Description") },
  ];
  const supportAreas = [t("problem1"), t("problem2"), t("problem3")];
  const values = [t("value1"), t("value2"), t("value3")];

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 outline-none">
      <section className="relative isolate bg-[#0b3b4a] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.22),_transparent_52%)]"
        />
        <div className="absolute right-4 top-4 z-10 rounded-lg bg-white px-3 py-1 shadow-sm sm:right-6 lg:right-8">
          <LanguageSelector />
        </div>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-8 text-center sm:px-6 sm:py-10 lg:px-8 lg:py-14">
            <h1 className="w-full text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {t("toolTitle")}
            </h1>
            <p className="mt-3 w-full text-lg leading-8 text-slate-100 sm:text-xl sm:leading-9">
              {t("homeSubtitle")}
            </p>
            <p className="mt-2 w-full text-base leading-7 text-slate-300">
              {t("homeDescription")}
            </p>
            <Link
              href="/questionnaire"
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-lg bg-teal-300 px-7 py-3 text-lg font-bold text-[#082f3b] shadow-lg shadow-black/15 transition hover:bg-teal-200 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {t("startQuestionnaire")}
              <span aria-hidden="true" className="ml-2">
                &rarr;
              </span>
            </Link>
        </div>
      </section>

      <section
        aria-labelledby="why-heading"
        className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8"
      >
        <div className="max-w-4xl">
          <h2
            id="why-heading"
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            {t("whyTitle")}
          </h2>
          <p className="mt-2 text-lg leading-8 text-slate-600">
            {t("whyDescription")}
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {reasons.map((reason) => (
            <article
              key={reason.title}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
            >
              <h3 className="text-lg font-bold text-slate-900">
                {reason.title}
              </h3>
              <p className="mt-2 text-base leading-7 text-slate-600">
                {reason.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
            <h3 className="text-lg font-bold text-slate-900">
              {t("problemsTitle")}
            </h3>
            <ul className="mt-3 space-y-2 text-base leading-7 text-slate-700">
              {supportAreas.map((area) => (
                <li key={area} className="flex gap-2">
                  <span aria-hidden="true" className="text-teal-700">
                    -
                  </span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              {t("valueTitle")}
            </h3>
            <ul className="mt-3 space-y-2 text-base leading-7 text-slate-700">
              {values.map((value) => (
                <li key={value} className="flex gap-2">
                  <span aria-hidden="true" className="text-teal-700">
                    -
                  </span>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        aria-labelledby="instructions-heading"
        className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8"
      >
        <div className="max-w-4xl">
          <h2
            id="instructions-heading"
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            {t("howTitle")}
          </h2>
          <p className="mt-2 text-lg leading-8 text-slate-600 md:whitespace-nowrap">
            {t("howDescription")}
          </p>
        </div>

        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {instructions.map((instruction, index) => (
            <li
              key={instruction.title}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-teal-100 text-base font-bold text-teal-800">
                {index + 1}
              </span>
              <h3 className="mt-3 text-lg font-bold text-slate-900">
                {instruction.title}
              </h3>
              <p className="mt-2 text-base leading-7 text-slate-600">
                {instruction.description}
              </p>
            </li>
          ))}
        </ol>

        <aside className="mt-4 rounded-xl border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-base leading-7 text-amber-950">
          <strong>{t("important")}</strong> {t("decisionNotice")}
        </aside>
      </section>

      <section
        aria-labelledby="citation-heading"
        className="border-y border-slate-200 bg-white"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-7 sm:px-6 sm:py-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-6 lg:px-8">
          <div>
            <h2
              id="citation-heading"
              className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
            >
              {t("citeTitle")}
            </h2>
            <p className="mt-2 text-lg leading-7 text-slate-600">
              {t("citeDescription")}
            </p>
          </div>

          <div className="min-w-0 rounded-xl border border-teal-200 bg-teal-50 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-base font-bold uppercase tracking-wide text-teal-800">
                {t("suggestedCitation")}
              </p>
              <CitationCopyButton citation={citation} />
            </div>
            <p className="mt-2 break-words text-base leading-7 text-slate-800">
              Johnston, D., Nguyen, L., Liu, Y., Wei, X., Dai, J., Li, J., Zhang, Z., &amp; Yang, Z. (2026). <cite>Consumer Rep Remuneration Tool</cite>{" "} [Web application]. i2i, UNSW Population Health and UNSW COMP9900/3900 Team T13C Cake.
            </p>
            <div className="mt-3 border-t border-teal-200 pt-3 text-base leading-7 text-slate-600">
              <p>
                <strong className="text-slate-800">{t("supervisors")}:</strong>{" "}
                Deborah Johnston and Loc Nguyen
              </p>
              <p className="mt-2">
                <strong className="text-slate-800">{t("studentGroup")}:</strong> UNSW
                COMP9900/3900 Team T13C
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-300">
        <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-5 text-base sm:px-6 md:grid-cols-[1.2fr_1fr] md:items-start lg:px-8">
          <div>
            <p className="font-bold text-slate-100">{t("contactUs")}</p>
            <div className="mt-2 space-y-1 leading-7">
              <p>Availability: Mon, Tue, Wed - Implementation to Impact (i2i)</p>
              <p>School of Population Health - Faculty of Medicine and Health</p>
              <p>L5 Health Translation Hub (C29) - UNSW Sydney NSW 2052</p>
              <p>
                E:{" "}
                <a
                  href="mailto:deborah.johnston@unsw.edu.au"
                  className="transition hover:text-slate-100"
                >
                  deborah.johnston@unsw.edu.au
                </a>{" "}
                T:{" "}
                <a href="tel:+610290659414" className="transition hover:text-slate-100">
                  +61 (02) 9065 9414
                </a>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:items-end md:text-right">
            <p>&copy; 2026 T13C Cake</p>
            <p>{t("developedWith")}</p>
            <nav
              aria-label="Footer navigation"
              className="mt-1 flex flex-wrap gap-x-4 gap-y-2 md:justify-end"
            >
              <Link
                href="/privacy"
                className="font-semibold text-teal-200 transition hover:text-white focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-teal-200"
              >
                {t("privacyScope")}
              </Link>
              <Link
                href="/feedback"
                className="font-semibold text-teal-200 transition hover:text-white focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-teal-200"
              >
                {t("anonymousFeedback")}
              </Link>
              <Link
                href="/admin"
                className="font-semibold text-teal-200 transition hover:text-white focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-teal-200"
              >
                {t("adminCentre")}
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </main>
  );
}

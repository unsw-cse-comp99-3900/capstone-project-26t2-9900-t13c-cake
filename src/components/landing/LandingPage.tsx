import Link from "next/link";
import { CitationCopyButton } from "./CitationCopyButton";

const instructions = [
  {
    title: "Describe your context",
    description:
      "Answer a short set of questions about the jurisdiction, context and consumer engagement level.",
  },
  {
    title: "View matched evidence",
    description:
      "See remuneration guidance and supporting evidence that are relevant to the circumstances you selected.",
  },
  {
    title: "Use the findings and cite the tool",
    description:
      "Draw on the results when planning budgets and preparing grant, governance, or ethics applications.",
  },
];

const citation =
  "Johnston, D., Nguyen, L., Liu, Y., Wei, X., Dai, J., Li, J., Zhang, Z., & Yang, Z. (2026). Consumer Rep Remuneration Tool [Web application]. i2i, UNSW Population Health and UNSW COMP9900/3900 Team T13C.";

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <section className="relative isolate bg-[#0b3b4a] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.22),_transparent_52%)]"
        />
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-8 text-center sm:px-6 sm:py-10 lg:px-8 lg:py-14">
            <h1 className="w-full text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Consumer Rep Remuneration Tool
            </h1>
            <p className="mt-3 w-full text-lg leading-8 text-slate-100 sm:text-xl sm:leading-9">
              Find relevant evidence to support fair remuneration for health consumer representatives in Australia.
            </p>
            <p className="mt-2 w-full text-base leading-7 text-slate-300">
              This decision tool is designed for researchers to seek guidance regarding the remuneration of consumer representatives across diverse populations and locations.
            </p>
            <Link
              href="/questionnaire"
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-lg bg-teal-300 px-7 py-3 text-lg font-bold text-[#082f3b] shadow-lg shadow-black/15 transition hover:bg-teal-200 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Start the questionnaire
              <span aria-hidden="true" className="ml-2">
                &rarr;
              </span>
            </Link>
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
            How the tool works?
          </h2>
          <p className="mt-2 text-lg leading-8 text-slate-600 md:whitespace-nowrap">
            Work through three simple stages.
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
          <strong>Important:</strong> This tool provides evidence-informed decision support. It does not replace your organisation&apos;s policies, funder requirements, legal advice, or professional judgement.
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
              How to cite the tool
            </h2>
            <p className="mt-2 text-lg leading-7 text-slate-600">
              Include this citation when referring to the tool.
            </p>
          </div>

          <div className="min-w-0 rounded-xl border border-teal-200 bg-teal-50 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-base font-bold uppercase tracking-wide text-teal-800">
                Suggested citation
              </p>
              <CitationCopyButton citation={citation} />
            </div>
            <p className="mt-2 break-words text-base leading-7 text-slate-800">
              Johnston, D., Nguyen, L., Liu, Y., Wei, X., Dai, J., Li, J., Zhang, Z., &amp; Yang, Z. (2026). <cite>Consumer Rep Remuneration Tool</cite>{" "} [Web application]. i2i, UNSW Population Health and UNSW COMP9900/3900 Team T13C Cake.
            </p>
            <div className="mt-3 border-t border-teal-200 pt-3 text-base leading-7 text-slate-600">
              <p>
                <strong className="text-slate-800">Project supervisors:</strong>{" "}
                Deborah Johnston and Loc Nguyen
              </p>
              <p className="mt-2">
                <strong className="text-slate-800">Student group:</strong> UNSW
                COMP9900/3900 Team T13C
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-300">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 text-base sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>&copy; 2026 T13C Cake</p>
          <div className="flex flex-col gap-1 md:items-end">
            <p>Developed with i2i, UNSW Population Health</p>
            <Link
              href="/admin"
              className="text-sm text-slate-400 transition hover:text-slate-200"
            >
              Administrator account centre
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

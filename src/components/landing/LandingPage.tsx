import Link from "next/link";

const featurePanels = [
  {
    title: "Why use it",
    summary: "Evidence-informed guidance tailored to the Australian context.",
    details:
      "Support fair and consistent remuneration planning with guidance matched to your research circumstances.",
  },
  {
    title: "Problems it helps solve",
    summary: "Difficulty finding relevant, current evidence on remuneration.",
    details: "Uncertainty about fair, reasonable and consistent payment.",
  },
  {
    title: "Value you gain",
    summary: "Save time, increase confidence and support better decisions.",
    details:
      "Use clearer evidence when preparing project budgets, governance notes and ethics materials.",
  },
  {
    title: "How to use",
    summary: "A simple 3-step questionnaire to match relevant evidence.",
    details:
      "Answer context questions, view matched results, then use and cite the guidance.",
  },
];

export function LandingPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen overflow-hidden bg-[#fbfcfa] text-slate-900 outline-none"
    >
      <section className="relative isolate flex min-h-[520px] border-b border-[#164f5f] bg-[#062c32] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(40,166,150,0.17),_transparent_36%),linear-gradient(180deg,_rgba(0,0,0,0.05),_rgba(0,0,0,0.18))]"
        />
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

        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 pb-10 pt-12 text-center sm:px-6 lg:px-8">
          <p className="landing-rise text-sm font-semibold uppercase tracking-[0.28em] text-teal-200">
            Evidence-informed decision support
          </p>
          <h1 className="landing-rise landing-rise-delay-1 mt-5 max-w-4xl font-[Georgia,serif] text-5xl font-normal leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Consumer Rep Remuneration Tool
          </h1>
          <p className="landing-rise landing-rise-delay-2 mt-5 max-w-2xl text-lg leading-8 text-slate-100">
            Find relevant evidence to support fair remuneration for health
            consumer representatives in Australia.
          </p>

          <div className="landing-rise landing-rise-delay-3 mt-9 flex w-full max-w-[465px] flex-col items-center gap-5">
            <Link
              href="/questionnaire"
              className="group inline-flex min-h-16 w-full items-center justify-center border border-teal-100/80 px-8 py-4 text-lg font-bold text-white transition hover:border-teal-100 hover:bg-teal-50 hover:text-[#062c32] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <span className="flex-1 text-center">Start questionnaire</span>
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
              How it works
              <span aria-hidden="true">&darr;</span>
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="overview-heading"
        id="how-it-works"
        className="border-b border-slate-200 bg-[#fbfcfa]"
      >
        <div className="mx-auto w-full max-w-7xl px-6 pb-8 pt-12 text-center sm:px-8 sm:pt-14">
          <p className="landing-rise text-sm font-bold text-slate-700">
            Evidence planning
          </p>
          <h2
            id="overview-heading"
            className="landing-rise landing-rise-delay-1 mt-4 font-[Georgia,serif] text-4xl font-normal leading-tight text-[#062c32] sm:text-5xl"
          >
            Support fair remuneration planning
          </h2>
          <p className="landing-rise landing-rise-delay-2 mx-auto mt-5 max-w-4xl text-lg leading-8 text-slate-600">
            Use evidence-informed guidance to make fair, transparent and
            defensible remuneration decisions for consumer representatives.
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
                <h3 className="text-xl font-bold text-[#062c32] transition group-hover:text-[#e95f45]">
                  {panel.title}
                </h3>
                <span
                  aria-hidden="true"
                  className="text-2xl leading-none text-teal-800 transition group-hover:rotate-45 group-hover:text-[#e95f45]"
                >
                  +
                </span>
              </div>
              <div className="mt-5 h-px w-full bg-transparent transition group-hover:bg-[#e95f45]" />
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

      <section className="border-b border-teal-100 bg-[#eef8f5]">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-9 sm:px-8 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr_1.2fr] lg:items-center">
          <div>
            <h2 className="font-[Georgia,serif] text-2xl text-[#062c32]">
              Contact / Support
            </h2>
            <p className="mt-2 text-base text-slate-600">We&apos;re here to help.</p>
          </div>
          <div className="border-slate-400/50 lg:border-l lg:pl-6">
            <p className="text-sm text-slate-700">Email</p>
            <a
              href="mailto:deborah.johnston@unsw.edu.au"
              className="mt-2 block text-sm font-semibold text-teal-800 transition hover:text-teal-950"
            >
              deborah.johnston@unsw.edu.au
            </a>
          </div>
          <div className="border-slate-400/50 lg:border-l lg:pl-6">
            <p className="text-sm text-slate-700">Phone</p>
            <a
              href="tel:+610290659414"
              className="mt-2 block text-sm font-semibold text-teal-800 transition hover:text-teal-950"
            >
              +61 (02) 9065 9414
            </a>
          </div>
          <div className="border-slate-400/50 lg:border-l lg:pl-6">
            <p className="text-sm text-slate-700">Feedback</p>
            <Link
              href="/feedback"
              className="mt-2 inline-flex items-center gap-3 text-sm font-semibold text-teal-800 transition hover:text-teal-950"
            >
              Send us feedback
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <Link
            href="/feedback"
            className="inline-flex min-h-12 items-center justify-center gap-3 border border-teal-800 px-5 py-3 text-sm font-semibold text-teal-900 transition hover:bg-teal-900 hover:text-white focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-teal-800"
          >
            View help &amp; FAQs
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <footer className="bg-[#061f27] text-slate-400">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6 text-sm sm:px-8 md:flex-row md:items-center md:justify-center md:gap-8">
          <p>&copy; 2026 Consumer Rep Remuneration Tool</p>
          <span aria-hidden="true" className="hidden h-5 w-px bg-slate-700 md:block" />
          <Link href="/privacy" className="transition hover:text-white">
            Privacy
          </Link>
          <span aria-hidden="true" className="hidden h-5 w-px bg-slate-700 md:block" />
          <Link href="/feedback" className="transition hover:text-white">
            Feedback
          </Link>
          <span aria-hidden="true" className="hidden h-5 w-px bg-slate-700 md:block" />
          <Link href="/admin" className="transition hover:text-white">
            About this tool
          </Link>
          <span aria-hidden="true" className="hidden h-5 w-px bg-slate-700 md:block" />
          <a href="#how-it-works" className="transition hover:text-white">
            Methodology &amp; sources
          </a>
        </div>
      </footer>
    </main>
  );
}

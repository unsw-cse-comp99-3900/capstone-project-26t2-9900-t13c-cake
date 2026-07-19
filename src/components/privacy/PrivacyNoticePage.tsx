import Link from "next/link";

const dataItems = [
  {
    title: "Questionnaire answers",
    description:
      "Your selections are used to match evidence in the browser session. They are not stored as a user profile.",
  },
  {
    title: "Evidence records",
    description:
      "The tool stores remuneration guidance from reviewed source documents so results can be filtered and cited.",
  },
  {
    title: "Anonymous feedback",
    description:
      "Optional feedback is stored without names, email addresses, phone numbers, or personal health information.",
  },
  {
    title: "Administrator access",
    description:
      "Administration areas are intended for authorised project staff who maintain evidence records and review anonymous survey responses.",
  },
];

export function PrivacyNoticePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="font-bold text-teal-800 transition hover:text-teal-950 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          >
            Consumer Rep Remuneration Tool
          </Link>
          <Link
            href="/questionnaire"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Start questionnaire
          </Link>
        </div>
      </div>

      <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-800">Privacy and data scope</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            How this tool handles information
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            This decision tool is designed to provide evidence-informed guidance without collecting
            personal identity information from public questionnaire users.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {dataItems.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">{item.title}</h2>
              <p className="mt-2 text-base leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>

        <aside className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-base leading-7 text-amber-950">
          <strong>Important:</strong> This tool provides indicative guidance only. Rates, policies,
          funding rules, and organisational procedures may change. Always confirm the latest
          requirements with the relevant publishing organisation before using the guidance.
        </aside>

        <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5">
          <h2 className="text-xl font-bold text-teal-950">Anonymous feedback</h2>
          <p className="mt-2 text-base leading-7 text-slate-700">
            Feedback is optional and should only describe your experience using the tool.
          </p>
          <Link
            href="/feedback"
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Open feedback survey
          </Link>
        </div>
      </section>
    </main>
  );
}

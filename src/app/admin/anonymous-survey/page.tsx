import Link from "next/link";
import { feedbackService } from "@/server/services/feedbackService";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AnonymousSurveyAdminPage() {
  const summary = await feedbackService.getAnonymousFeedbackSummary();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-teal-800">Administrator</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Anonymous survey data</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Back to admin
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Back to public tool
            </Link>
          </div>
        </div>
      </div>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-800">Survey overview</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {summary.totalResponses} anonymous response{summary.totalResponses === 1 ? "" : "s"}
          </h2>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
            Responses are stored without names, contact details, or personal health information.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950">Average rating</h3>
            <p className="mt-3 text-4xl font-bold text-teal-800">
              {summary.averageRating == null ? "No data" : `${summary.averageRating}/5`}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950">Rating spread</h3>
            <dl className="mt-3 grid grid-cols-5 gap-2 text-center">
              {[1, 2, 3, 4, 5].map((rating) => (
                <div key={rating} className="rounded-xl bg-slate-50 px-3 py-2">
                  <dt className="text-sm font-semibold text-slate-500">{rating}</dt>
                  <dd className="mt-1 text-xl font-bold text-slate-950">
                    {summary.ratingCounts[rating]}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Recent responses</h2>

          {summary.recentResponses.length === 0 ? (
            <p className="mt-3 text-base leading-7 text-slate-600">
              No anonymous feedback has been submitted yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              {summary.recentResponses.map((response) => (
                <article key={response.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span className="rounded-full bg-teal-100 px-3 py-1 font-bold text-teal-900">
                      {response.rating}/5
                    </span>
                    {response.partOfTool && (
                      <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-700">
                        {response.partOfTool}
                      </span>
                    )}
                    <span>{formatDate(response.createdAt)}</span>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                        Worked well
                      </h3>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                        {response.workedWell ?? "No comment"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                        Could improve
                      </h3>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                        {response.improvement ?? "No comment"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

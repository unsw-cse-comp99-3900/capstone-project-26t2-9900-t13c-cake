import Link from "next/link";
import { AnonymousFeedbackForm } from "./AnonymousFeedbackForm";

export function FeedbackPage() {
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
            href="/privacy"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Privacy notice
          </Link>
        </div>
      </div>

      <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-800">Feedback</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Share anonymous feedback
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Your comments help the team improve the tool. The form does not ask for identity or
            contact details.
          </p>
        </div>

        <AnonymousFeedbackForm />
      </section>
    </main>
  );
}

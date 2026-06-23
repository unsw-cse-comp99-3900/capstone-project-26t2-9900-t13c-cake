import Link from "next/link";
import { QuizWizard } from "@/components/quiz/QuizWizard";
import { QuizStateProvider } from "@/contexts/QuizStateContext";

export default function QuestionnairePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="font-bold text-teal-800 transition hover:text-teal-950 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          >
            Consumer Rep Remuneration Tool
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Back to home
          </Link>
        </div>
      </div>

      <QuizStateProvider>
        <QuizWizard />
      </QuizStateProvider>
    </main>
  );
}

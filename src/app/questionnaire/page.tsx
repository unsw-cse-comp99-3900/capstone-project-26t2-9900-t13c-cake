import Link from "next/link";
import { QuizWizard } from "@/components/quiz/QuizWizard";
import { QuizStateProvider } from "@/contexts/QuizStateContext";
import { LanguageSelector } from "@/components/language/LanguageSelector";
import { QuestionnaireHeaderText } from "@/components/language/QuestionnaireHeaderText";

export default function QuestionnairePage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-slate-50 text-slate-900 outline-none">
      <div className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <QuestionnaireHeaderText />
          <div className="flex flex-wrap items-center justify-end gap-3">
            <LanguageSelector />
            <Link
              href="/"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <QuestionnaireHeaderText homeOnly />
            </Link>
          </div>
        </div>
      </div>

      <QuizStateProvider>
        <QuizWizard />
      </QuizStateProvider>
    </main>
  );
}

import Link from "next/link";
import { QuizWizard } from "@/components/quiz/QuizWizard";
import { QuizStateProvider } from "@/contexts/QuizStateContext";
import { LanguageSelector } from "@/components/language/LanguageSelector";
import { QuestionnaireHeaderText } from "@/components/language/QuestionnaireHeaderText";

export default function QuestionnairePage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#fbfcfa] text-slate-900 outline-none">
      <div className="no-print bg-[#003f3b] text-white shadow-[0_1px_0_rgba(255,255,255,0.14)_inset]">
        <div className="flex min-h-[76px] w-full items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <QuestionnaireHeaderText />
          <div className="flex flex-wrap items-center justify-end gap-3">
            <LanguageSelector variant="questionnaire" />
            <Link
              href="/"
              className="min-h-10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Exit
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

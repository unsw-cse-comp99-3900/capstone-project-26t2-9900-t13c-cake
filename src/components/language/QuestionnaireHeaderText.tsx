"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function QuestionnaireHeaderText({ homeOnly = false }: { homeOnly?: boolean }) {
  const { t } = useLanguage();
  if (homeOnly) return <>{t("backHome")}</>;
  return (
    <Link
      href="/"
      className="font-bold text-teal-800 transition hover:text-teal-950 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
    >
      {t("toolTitle")}
    </Link>
  );
}

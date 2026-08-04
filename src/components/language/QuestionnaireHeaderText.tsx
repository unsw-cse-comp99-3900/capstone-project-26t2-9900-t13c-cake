"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

export function QuestionnaireHeaderText({ homeOnly = false }: { homeOnly?: boolean }) {
  const { t } = useLanguage();
  if (homeOnly) return <>{t("backHome")}</>;
  return (
    <Link
      href="/"
      className="font-[Georgia,serif] text-3xl font-normal tracking-tight text-white transition hover:text-teal-100 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white"
    >
      {t("toolTitle")}
    </Link>
  );
}

export function TranslatedText({ translationKey }: { translationKey: TranslationKey }) {
  const { t } = useLanguage();

  return <>{t(translationKey)}</>;
}

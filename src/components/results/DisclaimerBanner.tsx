"use client";

import { useLanguage } from "@/contexts/LanguageContext";

/** CAKE-5 - DisclaimerBanner */
export function DisclaimerBanner() {
  const { t } = useLanguage();
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
      <strong>{t("important")}</strong> {t("disclaimer")}
    </div>
  );
}

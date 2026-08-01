"use client";

import Link from "next/link";
import { useAdminAuth } from "@/components/admin/AdminLoginGate";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  adminNavigation,
  type AdminNavItem,
  type AdminNavStatus,
} from "@/lib/admin/adminNavigation";

function StatusBadge({ status }: { status: AdminNavStatus }) {
  const { t } = useLanguage();

  if (status === "available") {
    return (
      <span className="rounded-full bg-[#e8f7f3] px-2.5 py-1 text-xs font-bold text-[#006b63]">
        {t("available")}
      </span>
    );
  }

  return (
    <span className="rounded-full bg-[#f0f4f4] px-2.5 py-1 text-xs font-bold text-slate-600">
      {t("comingSoon")}
    </span>
  );
}

function getAdminNavText(item: AdminNavItem, t: ReturnType<typeof useLanguage>["t"]) {
  switch (item.id) {
    case "records":
      return {
        title: t("recordsTitle"),
        description: t("recordsDescription"),
      };
    case "account":
      return {
        title: t("accountSettingsTitle"),
        description: t("accountSettingsDescription"),
      };
    case "analytics":
      return {
        title: t("usageTitle"),
        description: t("usageDescription"),
      };
    case "surveys":
      return {
        title: t("surveysTitle"),
        description: t("surveysDescription"),
      };
    default:
      return {
        title: item.title,
        description: item.description,
      };
  }
}

function NavCard({ item }: { item: AdminNavItem }) {
  const { t } = useLanguage();
  const isDisabled = item.status === "coming_soon";
  const text = getAdminNavText(item, t);

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-[#051b1a]">{text.title}</h3>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <p className="mt-2 text-base leading-7 text-slate-600">{text.description}</p>
      {item.story && (
        <p className="mt-3 text-sm font-medium text-slate-500">{item.story}</p>
      )}
      <p className="mt-5 text-sm font-bold text-[#006b63]">
        {isDisabled ? t("previewArea") : t("open")}
        <span aria-hidden="true" className="ml-2">
          &rarr;
        </span>
      </p>
    </>
  );

  const className =
    "block rounded-[8px] border border-[#dce6e4] bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition hover:border-[#b8d9d4] hover:bg-[#fbfefd] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700";

  return (
    <Link href={item.href} className={className}>
      {cardContent}
    </Link>
  );
}

/** Administrator account centre hub */
export function AdminAccountCenter() {
  const { session } = useAdminAuth();
  const { t } = useLanguage();
  const username = session.status === "authenticated" ? session.username : t("administrator");

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(260px,0.34fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
      <div className="lg:sticky lg:top-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#006b63]">
          {t("accountCentre")}
        </p>
        <h2 className="mt-3 max-w-3xl font-[Georgia,serif] text-4xl font-normal leading-tight tracking-tight text-[#051b1a] sm:text-5xl lg:max-w-[360px]">
          {t("welcomeAdmin", { username })}
        </h2>
        <div className="mt-6 h-0.5 w-14 bg-[#006b63]" />
        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 lg:max-w-[330px]">
          {t("adminWelcomeText")}
        </p>
      </div>

      <div className="rounded-[24px] border border-[#cfe2df] bg-white/55 p-5 shadow-[0_12px_28px_rgba(15,23,42,0.045)] backdrop-blur-sm sm:p-7 lg:p-10">
        <div className="border-b border-[#dce6e4] pb-5">
          <h3 className="text-2xl font-bold text-[#051b1a]">{t("adminTools")}</h3>
          <p className="mt-2 text-base leading-7 text-slate-600">
            {t("adminToolsOverview")}
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {adminNavigation.map((item) => (
            <NavCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

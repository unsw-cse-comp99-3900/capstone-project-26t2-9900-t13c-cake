"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

const routeNames: Record<string, string> = {
  "/": "Home",
  "/questionnaire": "Questionnaire",
  "/privacy": "Privacy notice",
  "/feedback": "Anonymous feedback",
  "/admin": "Administrator account centre",
  "/admin/records": "Evidence records",
  "/admin/account": "Administrator account settings",
  "/admin/analytics": "Administrator analytics",
  "/admin/forgot-password": "Administrator account recovery",
  "/admin/import-export": "Administrator import and export",
  "/admin/password": "Administrator password settings",
  "/admin/surveys": "Anonymous survey data",
  "/admin/username": "Administrator username settings",
};

/** CAKE-8: shared keyboard and screen-reader support on public and admin routes. */
export function AccessibilityShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { language } = useLanguage();

  useEffect(() => {
    const routeName = routeNames[pathname] ?? "Consumer Rep Remuneration Tool";
    document.title = language === "zh-CN"
      ? `${pathname === "/questionnaire" ? "问卷" : routeName} | 消费者代表报酬工具`
      : `${routeName} | Consumer Rep Remuneration Tool`;
  }, [language, pathname]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        {language === "zh-CN" ? "跳至主要内容" : "Skip to main content"}
      </a>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {language === "zh-CN" ? "页面已加载" : routeNames[pathname] ?? "Page loaded"}
      </p>
      {children}
    </>
  );
}

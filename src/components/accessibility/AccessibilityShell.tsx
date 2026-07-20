"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

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

  useEffect(() => {
    const routeName = routeNames[pathname] ?? "Consumer Rep Remuneration Tool";
    document.title = `${routeName} | Consumer Rep Remuneration Tool`;
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {routeNames[pathname] ?? "Page loaded"}
      </p>
      {children}
    </>
  );
}

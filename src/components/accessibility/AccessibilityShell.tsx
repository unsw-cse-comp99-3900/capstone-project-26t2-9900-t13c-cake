"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const routeNames: Record<string, string> = {
  "/": "Home",
  "/questionnaire": "Questionnaire",
  "/admin": "Administrator account centre",
  "/admin/records": "Evidence records",
  "/admin/account": "Administrator account settings",
  "/admin/password": "Change administrator password",
  "/admin/username": "Change administrator username",
  "/admin/forgot-password": "Reset administrator password",
};

/** Shared keyboard and screen-reader support for public and admin routes. */
export function AccessibilityShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const routeName = routeNames[pathname] ?? "Consumer Rep Remuneration Tool";
    document.title = `${routeName} | Consumer Rep Remuneration Tool`;

    const main = document.getElementById("main-content");
    if (main && window.location.hash !== "#main-content") {
      main.focus({ preventScroll: true });
    }
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

"use client";

import { useEffect } from "react";
import { useBrowserPathname } from "@/hooks/useBrowserPathname";
import type { WebsiteUsageEventType } from "@/server/services/websiteUsageService";

/** Fire-and-forget anonymous usage events (skips /admin paths). */
export function trackWebsiteUsage(
  eventType: WebsiteUsageEventType,
  metadata?: Record<string, unknown>,
) {
  if (typeof window === "undefined") {
    return;
  }

  const path = window.location.pathname;
  if (path.startsWith("/admin")) {
    return;
  }

  void fetch("/api/usage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType,
      path,
      metadata,
    }),
    keepalive: true,
  }).catch(() => {
    // Usage metrics should never interrupt the public tool.
  });
}

/** Records public page views for anonymous analytics. */
export function WebsiteUsageTracker() {
  const pathname = useBrowserPathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    trackWebsiteUsage("page_view");
  }, [pathname]);

  return null;
}

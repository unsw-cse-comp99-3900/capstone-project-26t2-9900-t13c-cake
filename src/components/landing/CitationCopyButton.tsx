"use client";

import { useEffect, useRef, useState } from "react";

type CitationCopyButtonProps = {
  citation: string;
};

export function CitationCopyButton({ citation }: CitationCopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  function showStatus(nextStatus: "copied" | "failed") {
    setStatus(nextStatus);

    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }

    resetTimer.current = setTimeout(() => setStatus("idle"), 1800);
  }

  async function copyCitation() {
    try {
      await navigator.clipboard.writeText(citation);
      showStatus("copied");
    } catch {
      showStatus("failed");
    }
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={copyCitation}
        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-teal-700 bg-white px-4 py-2 text-sm font-bold text-teal-800 transition hover:bg-teal-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
      >
        Copy citation
      </button>
      {status !== "idle" && (
        <span
          role="status"
          className="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
        >
          {status === "copied" ? "Copied" : "Copy failed"}
        </span>
      )}
    </div>
  );
}

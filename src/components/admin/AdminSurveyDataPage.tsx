"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/components/admin/AdminLoginGate";
import { adminNavigation, ADMIN_HOME_PATH } from "@/lib/admin/adminNavigation";

type SurveyResponse = {
  id: string;
  rating: number;
  partOfTool: string | null;
  workedWell: string | null;
  improvement: string | null;
  createdAt: string;
};

type SurveySummary = {
  totalResponses: number;
  averageRating: number | null;
  ratingCounts: Record<number, number>;
  recentResponses: SurveyResponse[];
};

type SurveyState =
  | { status: "loading" }
  | { status: "ready"; summary: SurveySummary }
  | { status: "error"; message: string };

const item = adminNavigation.find((entry) => entry.id === "surveys");

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminSurveyDataPage() {
  const { session } = useAdminAuth();
  const [state, setState] = useState<SurveyState>({ status: "loading" });

  useEffect(() => {
    if (session.status !== "authenticated") {
      return;
    }

    let isActive = true;

    async function loadSurveyData() {
      setState({ status: "loading" });

      try {
        const response = await fetch("/api/admin/feedback", { cache: "no-store" });
        const payload = (await response.json()) as SurveySummary | { error?: string };

        if (!response.ok) {
          const message =
            "error" in payload && payload.error
              ? payload.error
              : "Unable to load anonymous survey data.";
          throw new Error(message);
        }

        if (isActive) {
          setState({ status: "ready", summary: payload as SurveySummary });
        }
      } catch (error) {
        if (isActive) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Unable to load anonymous survey data.",
          });
        }
      }
    }

    void loadSurveyData();

    return () => {
      isActive = false;
    };
  }, [session.status]);

  if (!item || session.status !== "authenticated") {
    return null;
  }

  return (
    <section className="space-y-6">
      <div>
        <Link
          href={ADMIN_HOME_PATH}
          className="inline-flex items-center text-sm font-semibold text-teal-800 transition hover:text-teal-900"
        >
          <span aria-hidden="true" className="mr-2">
            &larr;
          </span>
          Back to account centre
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{item.title}</h2>
            <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
              {item.description}
            </p>
          </div>
          <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
            Available
          </span>
        </div>
      </div>

      {state.status === "loading" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-base text-slate-600 shadow-sm">
          Loading anonymous survey data...
        </div>
      )}

      {state.status === "error" && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-6 text-base text-red-800 shadow-sm"
        >
          {state.message}
        </div>
      )}

      {state.status === "ready" && <SurveySummaryView summary={state.summary} />}
    </section>
  );
}

function SurveySummaryView({ summary }: { summary: SurveySummary }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Average rating</h3>
          <p className="mt-3 text-4xl font-bold text-teal-800">
            {summary.averageRating == null ? "No data" : `${summary.averageRating}/5`}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Based on {summary.totalResponses} anonymous response
            {summary.totalResponses === 1 ? "" : "s"}.
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Rating spread</h3>
          <dl className="mt-4 grid grid-cols-5 gap-2 text-center">
            {[1, 2, 3, 4, 5].map((rating) => (
              <div key={rating} className="rounded-lg bg-slate-50 px-3 py-2">
                <dt className="text-sm font-semibold text-slate-500">{rating}</dt>
                <dd className="mt-1 text-xl font-bold text-slate-900">
                  {summary.ratingCounts[rating]}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Recent responses</h3>
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
          Responses are stored without names, contact details, or personal health information.
        </p>

        {summary.recentResponses.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-base leading-7 text-slate-600">
            No anonymous feedback has been submitted yet.
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {summary.recentResponses.map((response) => (
              <article key={response.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span className="rounded-full bg-teal-100 px-3 py-1 font-bold text-teal-900">
                    {response.rating}/5
                  </span>
                  {response.partOfTool && (
                    <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-700">
                      {response.partOfTool}
                    </span>
                  )}
                  <span>{formatDate(response.createdAt)}</span>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                      Worked well
                    </h4>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                      {response.workedWell ?? "No comment"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                      Could improve
                    </h4>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                      {response.improvement ?? "No comment"}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

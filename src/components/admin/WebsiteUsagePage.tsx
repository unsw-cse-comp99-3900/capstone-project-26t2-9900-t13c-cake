"use client";

import { useEffect, useState } from "react";
import type {
  WebsiteUsagePeriodDays,
  WebsiteUsageSummary,
} from "@/server/services/websiteUsageService";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; summary: WebsiteUsageSummary };

const PERIOD_OPTIONS: WebsiteUsagePeriodDays[] = [30, 90, 180];

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildUsageDays(summary: WebsiteUsageSummary, periodDays: WebsiteUsagePeriodDays) {
  const countsByDate = new Map(summary.dailyUsage.map((day) => [day.date, day]));
  const today = new Date();

  return Array.from({ length: periodDays }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (periodDays - 1 - index));
    const dateKey = toDateKey(date);
    const day = countsByDate.get(dateKey);

    return {
      date: dateKey,
      label: new Intl.DateTimeFormat("en-AU", {
        day: "2-digit",
        month: "short",
      }).format(date),
      pageViews: day?.pageViews ?? 0,
      questionnaireStarts: day?.questionnaireStarts ?? 0,
      questionnaireCompletions: day?.questionnaireCompletions ?? 0,
    };
  });
}

const LINE_SERIES = [
  {
    key: "pageViews",
    label: "Page views",
    color: "#14b8a6",
  },
  {
    key: "questionnaireStarts",
    label: "Quiz starts",
    color: "#3b82f6",
  },
  {
    key: "questionnaireCompletions",
    label: "Quiz completions",
    color: "#f43f5e",
  },
] as const;

function niceMax(value: number): number {
  if (value <= 5) {
    return Math.max(1, value);
  }

  return Math.ceil(value / 5) * 5;
}

function DailyLineChart({ summary }: { summary: WebsiteUsageSummary }) {
  const days = buildUsageDays(summary, summary.periodDays);
  const maxCount = niceMax(
    Math.max(
      0,
      ...days.flatMap((day) => [
        day.pageViews,
        day.questionnaireStarts,
        day.questionnaireCompletions,
      ]),
    ),
  );
  const width = 960;
  const height = 360;
  const paddingLeft = 44;
  const paddingRight = 24;
  const paddingTop = 24;
  const paddingBottom = 32;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const xForIndex = (index: number) =>
    paddingLeft + (plotWidth * index) / Math.max(1, days.length - 1);
  const yForValue = (value: number) =>
    paddingTop + plotHeight - (value / maxCount) * plotHeight;
  const series = LINE_SERIES.map((line) => {
    const points = days.map((day, index) => ({
      date: day.date,
      label: day.label,
      value: day[line.key],
      x: xForIndex(index),
      y: yForValue(day[line.key]),
    }));

    return {
      ...line,
      points,
      path: points
        .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
        .join(" "),
    };
  });
  const total = days.reduce(
    (sum, day) => sum + day.pageViews + day.questionnaireStarts + day.questionnaireCompletions,
    0,
  );
  const ticks = Array.from(new Set([maxCount, Math.floor(maxCount / 2), 0]));

  return (
    <div className="mt-4">
      <div className="mb-3 flex flex-wrap gap-3">
        {LINE_SERIES.map((line) => (
          <span key={line.key} className="inline-flex items-center gap-2 text-sm text-slate-700">
            <span className="h-0.5 w-6 rounded-full" style={{ backgroundColor: line.color }} />
            {line.label}
          </span>
        ))}
      </div>
      <div>
        <svg
          role="img"
          aria-label={`Line chart of page views, quiz starts, and quiz completions over the last ${summary.periodDays} days`}
          viewBox={`0 0 ${width} ${height}`}
          className="aspect-[8/3] w-full rounded-lg border border-slate-200 bg-white"
        >
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={height - paddingBottom}
            stroke="#cbd5e1"
            strokeWidth="1"
          />
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="#cbd5e1"
            strokeWidth="1"
          />
          {ticks.map((value) => {
            const y = yForValue(value);
            return (
              <g key={value}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text x={10} y={y + 4} className="fill-slate-500 text-[11px]">
                  {value}
                </text>
              </g>
            );
          })}
          {series.map((line) => (
            <g key={line.key}>
              <path
                d={line.path}
                fill="none"
                stroke={line.color}
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {line.points.map((point) => (
                <g key={`${line.key}-${point.date}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={line.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="cursor-pointer transition hover:brightness-110"
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="9"
                    fill="transparent"
                    className="cursor-pointer"
                  >
                    <title>
                      {point.label}: {point.value} {line.label.toLowerCase()}
                    </title>
                  </circle>
                </g>
              ))}
            </g>
          ))}
          {[0, Math.floor((days.length - 1) / 2), days.length - 1].map((dayIndex) => {
            const day = days[dayIndex];
            const x = xForIndex(dayIndex);

            return (
              <text
                key={day.date}
                x={x}
                y={height - 7}
                textAnchor={
                  x === paddingLeft
                    ? "start"
                    : x > width - paddingRight - 5
                      ? "end"
                      : "middle"
                }
                className="fill-slate-500 text-[11px]"
              >
                {day.label}
              </text>
            );
          })}
        </svg>
      </div>
      {total === 0 ? (
        <p className="mt-3 text-sm text-slate-600">No usage events recorded yet.</p>
      ) : null}
    </div>
  );
}

const PIE_COLORS = [
  "#14b8a6",
  "#3b82f6",
  "#f97316",
  "#8b5cf6",
  "#f43f5e",
  "#22c55e",
  "#06b6d4",
  "#eab308",
] as const;

function PieChart({
  title,
  data,
}: {
  title: string;
  data: Array<{ label: string; count: number }>;
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const radius = 82;
  const center = 90;
  let runningAngle = -90;
  const slices = data.map((item, index) => {
    const percentage = item.count / total;
    const startAngle = runningAngle;
    const endAngle = runningAngle + percentage * 360;
    runningAngle = endAngle;
    const startRadians = (Math.PI / 180) * startAngle;
    const endRadians = (Math.PI / 180) * endAngle;
    const startX = center + radius * Math.cos(startRadians);
    const startY = center + radius * Math.sin(startRadians);
    const endX = center + radius * Math.cos(endRadians);
    const endY = center + radius * Math.sin(endRadians);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    const path =
      percentage >= 1
        ? `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${
            center - radius
          } A ${radius} ${radius} 0 1 1 ${center} ${center - radius}`
        : `M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

    return {
      ...item,
      path,
      percentage: Math.round(percentage * 100),
      color: PIE_COLORS[index % PIE_COLORS.length],
    };
  });

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h4 className="font-bold text-slate-900">{title}</h4>
      {total === 0 ? (
        <p className="mt-3 text-sm text-slate-600">No completed questionnaires recorded yet.</p>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start">
          <div className="flex h-44 items-start justify-center">
            <svg
              role="img"
              aria-label={`${title} pie chart`}
              viewBox="0 0 180 180"
              className="size-44 overflow-visible rounded-full border border-slate-200"
            >
              {slices.map((slice) => (
                <path
                  key={slice.label}
                  d={slice.path}
                  fill={slice.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer transition opacity-95 hover:opacity-100 hover:brightness-110"
                >
                  <title>
                    {slice.label}: {slice.count} ({slice.percentage}%)
                  </title>
                </path>
              ))}
            </svg>
          </div>
          <div className="space-y-2">
            {slices.map((slice) => (
              <div key={slice.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate font-semibold text-slate-700">{slice.label}</span>
                </span>
                <span className="shrink-0 text-slate-600">
                  {slice.count} ({slice.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function PeriodSelector({
  selectedPeriod,
  onSelectPeriod,
}: {
  selectedPeriod: WebsiteUsagePeriodDays;
  onSelectPeriod: (periodDays: WebsiteUsagePeriodDays) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
      {PERIOD_OPTIONS.map((periodDays) => {
        const isSelected = periodDays === selectedPeriod;

        return (
          <button
            key={periodDays}
            type="button"
            onClick={() => onSelectPeriod(periodDays)}
            aria-pressed={isSelected}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              isSelected
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            {periodDays} days
          </button>
        );
      })}
    </div>
  );
}

/** Admin analytics dashboard for anonymous website usage metrics. */
export function WebsiteUsagePage() {
  const [selectedPeriod, setSelectedPeriod] = useState<WebsiteUsagePeriodDays>(30);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    async function loadUsage() {
      try {
        setState({ status: "loading" });
        const response = await fetch(`/api/usage?days=${selectedPeriod}`, { cache: "no-store" });
        const data = (await response.json()) as WebsiteUsageSummary | { error?: string };

        if (!response.ok) {
          throw new Error("error" in data ? data.error : "Unable to load website usage");
        }

        if (isMounted) {
          setState({ status: "ready", summary: data as WebsiteUsageSummary });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Unable to load website usage",
          });
        }
      }
    }

    void loadUsage();

    return () => {
      isMounted = false;
    };
  }, [selectedPeriod]);

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-lg font-bold text-slate-900">Last {selectedPeriod} days</h3>
      <PeriodSelector selectedPeriod={selectedPeriod} onSelectPeriod={setSelectedPeriod} />
    </div>
  );

  if (state.status === "loading") {
    return (
      <div className="space-y-6">
        {header}
        <p>Loading anonymised usage metrics...</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="space-y-6">
        {header}
        <p role="alert">{state.message}</p>
      </div>
    );
  }

  const { summary } = state;

  return (
    <div className="space-y-6">
      {header}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Page views" value={summary.totals.pageViews.toString()} />
        <MetricCard
          label="Quiz starts"
          value={summary.totals.questionnaireStarts.toString()}
        />
        <MetricCard
          label="Quiz completions"
          value={summary.totals.questionnaireCompletions.toString()}
        />
        <MetricCard label="Completion rate" value={`${summary.totals.completionRate}%`} />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="font-bold text-slate-900">Daily website usage</h4>
        <DailyLineChart summary={summary} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <PieChart title="Jurisdiction selections" data={summary.jurisdictionSelections} />
        <PieChart title="Context selections" data={summary.contextSelections} />
      </div>
    </div>
  );
}

import { randomUUID } from "node:crypto";
import { prisma } from "@/server/db/prisma";

export type WebsiteUsageEventType =
  | "page_view"
  | "questionnaire_start"
  | "questionnaire_complete";

export type WebsiteUsageSummary = {
  periodDays: WebsiteUsagePeriodDays;
  totals: {
    pageViews: number;
    questionnaireStarts: number;
    questionnaireCompletions: number;
    completionRate: number;
  };
  dailyPageViews: Array<{
    date: string;
    count: number;
  }>;
  dailyUsage: Array<{
    date: string;
    pageViews: number;
    questionnaireStarts: number;
    questionnaireCompletions: number;
  }>;
  jurisdictionSelections: Array<{
    label: string;
    count: number;
  }>;
  contextSelections: Array<{
    label: string;
    count: number;
  }>;
  topPages: Array<{
    path: string;
    count: number;
  }>;
  recentEvents: Array<{
    id: string;
    eventType: WebsiteUsageEventType;
    path: string;
    createdAt: string;
  }>;
};

const EVENT_TYPES = new Set<WebsiteUsageEventType>([
  "page_view",
  "questionnaire_start",
  "questionnaire_complete",
]);

export const WEBSITE_USAGE_PERIOD_DAYS = [30, 90, 180] as const;
export type WebsiteUsagePeriodDays = (typeof WEBSITE_USAGE_PERIOD_DAYS)[number];

const WEBSITE_USAGE_RETENTION_DAYS = 180;
const USAGE_CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

let lastUsageCleanupAt = 0;

type CountRow = {
  count: bigint | number;
};

type DailyRow = {
  date: string;
  count: bigint | number;
};

type DailyUsageRow = {
  date: string;
  eventType: WebsiteUsageEventType;
  count: bigint | number;
};

type TopPageRow = {
  path: string;
  count: bigint | number;
};

type RecentEventRow = {
  id: string;
  eventType: WebsiteUsageEventType;
  path: string;
  createdAt: Date | string;
};

type MetadataRow = {
  metadata: string | null;
};

function toNumber(value: bigint | number): number {
  return typeof value === "bigint" ? Number(value) : value;
}

async function ensureUsageTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS website_usage_events (
      id TEXT PRIMARY KEY NOT NULL,
      eventType TEXT NOT NULL,
      path TEXT NOT NULL,
      metadata TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS website_usage_events_eventType_createdAt_idx
    ON website_usage_events(eventType, createdAt)
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS website_usage_events_path_createdAt_idx
    ON website_usage_events(path, createdAt)
  `;
}

function validateEventType(value: unknown): WebsiteUsageEventType {
  if (typeof value !== "string" || !EVENT_TYPES.has(value as WebsiteUsageEventType)) {
    throw new Error("eventType is not supported");
  }
  return value as WebsiteUsageEventType;
}

export function parseWebsiteUsagePeriodDays(value: unknown): WebsiteUsagePeriodDays {
  const parsed = typeof value === "string" ? Number(value) : value;

  if (
    typeof parsed === "number" &&
    WEBSITE_USAGE_PERIOD_DAYS.includes(parsed as WebsiteUsagePeriodDays)
  ) {
    return parsed as WebsiteUsagePeriodDays;
  }

  return 30;
}

function validatePath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.length > 200) {
    throw new Error("path must be a site path");
  }
  return value;
}

function stringifyMetadata(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return JSON.stringify(value).slice(0, 2000);
}

function incrementSelectionCount(counts: Map<string, number>, value: unknown) {
  if (typeof value !== "string") {
    return;
  }

  const label = value.trim();
  if (!label) {
    return;
  }

  counts.set(label, (counts.get(label) ?? 0) + 1);
}

function toSelectionCounts(counts: Map<string, number>) {
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

function parseSelectionBreakdowns(rows: MetadataRow[]) {
  const jurisdictionCounts = new Map<string, number>();
  const contextCounts = new Map<string, number>();

  for (const row of rows) {
    if (!row.metadata) {
      continue;
    }

    try {
      const metadata = JSON.parse(row.metadata) as {
        jurisdictions?: unknown;
        contexts?: unknown;
      };

      if (Array.isArray(metadata.jurisdictions)) {
        metadata.jurisdictions.forEach((jurisdiction) =>
          incrementSelectionCount(jurisdictionCounts, jurisdiction),
        );
      }
      if (Array.isArray(metadata.contexts)) {
        metadata.contexts.forEach((context) => incrementSelectionCount(contextCounts, context));
      }
    } catch {
      // Ignore malformed historical metadata.
    }
  }

  return {
    jurisdictionSelections: toSelectionCounts(jurisdictionCounts),
    contextSelections: toSelectionCounts(contextCounts),
  };
}

function parseDailyUsage(rows: DailyUsageRow[]) {
  const usageByDate = new Map<
    string,
    {
      date: string;
      pageViews: number;
      questionnaireStarts: number;
      questionnaireCompletions: number;
    }
  >();

  for (const row of rows) {
    const usage = usageByDate.get(row.date) ?? {
      date: row.date,
      pageViews: 0,
      questionnaireStarts: 0,
      questionnaireCompletions: 0,
    };
    const count = toNumber(row.count);

    if (row.eventType === "page_view") {
      usage.pageViews = count;
    } else if (row.eventType === "questionnaire_start") {
      usage.questionnaireStarts = count;
    } else if (row.eventType === "questionnaire_complete") {
      usage.questionnaireCompletions = count;
    }

    usageByDate.set(row.date, usage);
  }

  return Array.from(usageByDate.values()).sort((left, right) =>
    left.date.localeCompare(right.date),
  );
}

async function deleteExpiredUsageEvents({ force = false }: { force?: boolean } = {}) {
  const now = Date.now();
  if (!force && now - lastUsageCleanupAt < USAGE_CLEANUP_INTERVAL_MS) {
    return;
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - WEBSITE_USAGE_RETENTION_DAYS);
  const cutoffIso = cutoff.toISOString();

  await prisma.$executeRaw`
    DELETE FROM website_usage_events
    WHERE CASE
      WHEN typeof(createdAt) = 'integer' THEN datetime(createdAt / 1000, 'unixepoch')
      ELSE datetime(createdAt)
    END < datetime(${cutoffIso})
  `;
  lastUsageCleanupAt = now;
}

/** Website usage metrics use anonymous aggregate events only. */
export const websiteUsageService = {
  async recordEvent(payload: unknown): Promise<void> {
    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
      throw new Error("Usage payload must be an object");
    }

    const record = payload as Record<string, unknown>;
    const eventType = validateEventType(record.eventType);
    const path = validatePath(record.path);
    const metadata = stringifyMetadata(record.metadata);

    await ensureUsageTable();
    await deleteExpiredUsageEvents();
    await prisma.$executeRaw`
      INSERT INTO website_usage_events (id, eventType, path, metadata)
      VALUES (${randomUUID()}, ${eventType}, ${path}, ${metadata})
    `;
  },

  async getSummary(periodDays: WebsiteUsagePeriodDays = 30): Promise<WebsiteUsageSummary> {
    await ensureUsageTable();
    await deleteExpiredUsageEvents({ force: true });

    const since = new Date();
    since.setDate(since.getDate() - periodDays);
    const sinceIso = since.toISOString();

    const [pageViews] = await prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*) AS count
      FROM website_usage_events
      WHERE eventType = 'page_view'
        AND CASE
          WHEN typeof(createdAt) = 'integer' THEN datetime(createdAt / 1000, 'unixepoch')
          ELSE datetime(createdAt)
        END >= datetime(${sinceIso})
    `;
    const [starts] = await prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*) AS count
      FROM website_usage_events
      WHERE eventType = 'questionnaire_start'
        AND CASE
          WHEN typeof(createdAt) = 'integer' THEN datetime(createdAt / 1000, 'unixepoch')
          ELSE datetime(createdAt)
        END >= datetime(${sinceIso})
    `;
    const [completions] = await prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*) AS count
      FROM website_usage_events
      WHERE eventType = 'questionnaire_complete'
        AND CASE
          WHEN typeof(createdAt) = 'integer' THEN datetime(createdAt / 1000, 'unixepoch')
          ELSE datetime(createdAt)
        END >= datetime(${sinceIso})
    `;

    const dailyPageViews = await prisma.$queryRaw<DailyRow[]>`
      SELECT CASE
          WHEN typeof(createdAt) = 'integer' THEN date(createdAt / 1000, 'unixepoch')
          ELSE date(createdAt)
        END AS date,
        COUNT(*) AS count
      FROM website_usage_events
      WHERE eventType = 'page_view'
        AND CASE
          WHEN typeof(createdAt) = 'integer' THEN datetime(createdAt / 1000, 'unixepoch')
          ELSE datetime(createdAt)
        END >= datetime(${sinceIso})
      GROUP BY date
      ORDER BY date ASC
    `;
    const dailyUsageRows = await prisma.$queryRaw<DailyUsageRow[]>`
      SELECT CASE
          WHEN typeof(createdAt) = 'integer' THEN date(createdAt / 1000, 'unixepoch')
          ELSE date(createdAt)
        END AS date,
        eventType,
        COUNT(*) AS count
      FROM website_usage_events
      WHERE eventType IN ('page_view', 'questionnaire_start', 'questionnaire_complete')
        AND CASE
          WHEN typeof(createdAt) = 'integer' THEN datetime(createdAt / 1000, 'unixepoch')
          ELSE datetime(createdAt)
        END >= datetime(${sinceIso})
      GROUP BY date, eventType
      ORDER BY date ASC
    `;
    const topPages = await prisma.$queryRaw<TopPageRow[]>`
      SELECT path, COUNT(*) AS count
      FROM website_usage_events
      WHERE eventType = 'page_view'
        AND CASE
          WHEN typeof(createdAt) = 'integer' THEN datetime(createdAt / 1000, 'unixepoch')
          ELSE datetime(createdAt)
        END >= datetime(${sinceIso})
      GROUP BY path
      ORDER BY count DESC, path ASC
      LIMIT 5
    `;
    const recentEvents = await prisma.$queryRaw<RecentEventRow[]>`
      SELECT id, eventType, path, createdAt
      FROM website_usage_events
      ORDER BY createdAt DESC
      LIMIT 10
    `;
    const completionMetadata = await prisma.$queryRaw<MetadataRow[]>`
      SELECT metadata
      FROM website_usage_events
      WHERE eventType = 'questionnaire_complete'
        AND CASE
          WHEN typeof(createdAt) = 'integer' THEN datetime(createdAt / 1000, 'unixepoch')
          ELSE datetime(createdAt)
        END >= datetime(${sinceIso})
    `;

    const startCount = toNumber(starts?.count ?? 0);
    const completionCount = toNumber(completions?.count ?? 0);
    const selectionBreakdowns = parseSelectionBreakdowns(completionMetadata);

    return {
      periodDays,
      totals: {
        pageViews: toNumber(pageViews?.count ?? 0),
        questionnaireStarts: startCount,
        questionnaireCompletions: completionCount,
        completionRate: startCount === 0 ? 0 : Math.round((completionCount / startCount) * 100),
      },
      dailyPageViews: dailyPageViews.map((row) => ({
        date: row.date,
        count: toNumber(row.count),
      })),
      dailyUsage: parseDailyUsage(dailyUsageRows),
      jurisdictionSelections: selectionBreakdowns.jurisdictionSelections,
      contextSelections: selectionBreakdowns.contextSelections,
      topPages: topPages.map((row) => ({
        path: row.path,
        count: toNumber(row.count),
      })),
      recentEvents: recentEvents.map((row) => ({
        id: row.id,
        eventType: row.eventType,
        path: row.path,
        createdAt:
          row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
      })),
    };
  },
};

-- Anonymous website usage events for admin analytics.
CREATE TABLE "website_usage_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "website_usage_events_eventType_createdAt_idx"
ON "website_usage_events"("eventType", "createdAt");

CREATE INDEX "website_usage_events_path_createdAt_idx"
ON "website_usage_events"("path", "createdAt");

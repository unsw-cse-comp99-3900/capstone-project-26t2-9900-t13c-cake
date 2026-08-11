import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  parseWebsiteUsagePeriodDays,
  websiteUsageService,
} from "@/server/services/websiteUsageService";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    $executeRaw: vi.fn(),
    $queryRaw: vi.fn(),
  },
}));

import { prisma } from "@/server/db/prisma";

describe("websiteUsageService", () => {
  beforeEach(() => {
    vi.mocked(prisma.$executeRaw).mockReset();
    vi.mocked(prisma.$queryRaw).mockReset();
    vi.mocked(prisma.$executeRaw).mockResolvedValue(0);
  });

  describe("parseWebsiteUsagePeriodDays", () => {
    it("accepts supported period values", () => {
      expect(parseWebsiteUsagePeriodDays(30)).toBe(30);
      expect(parseWebsiteUsagePeriodDays("90")).toBe(90);
      expect(parseWebsiteUsagePeriodDays(180)).toBe(180);
    });

    it("defaults unsupported values to 30 days", () => {
      expect(parseWebsiteUsagePeriodDays(7)).toBe(30);
      expect(parseWebsiteUsagePeriodDays("nope")).toBe(30);
      expect(parseWebsiteUsagePeriodDays(null)).toBe(30);
    });
  });

  describe("recordEvent", () => {
    it("rejects non-object payloads and unsupported event types", async () => {
      await expect(websiteUsageService.recordEvent(null)).rejects.toThrow(
        /Usage payload must be an object/i,
      );
      await expect(
        websiteUsageService.recordEvent({ eventType: "click", path: "/" }),
      ).rejects.toThrow(/eventType is not supported/i);
    });

    it("rejects invalid paths", async () => {
      await expect(
        websiteUsageService.recordEvent({
          eventType: "page_view",
          path: "relative",
        }),
      ).rejects.toThrow(/path must be a site path/i);

      await expect(
        websiteUsageService.recordEvent({
          eventType: "page_view",
          path: `/${"a".repeat(201)}`,
        }),
      ).rejects.toThrow(/path must be a site path/i);
    });

    it("inserts a validated event and stringifies metadata", async () => {
      await websiteUsageService.recordEvent({
        eventType: "questionnaire_complete",
        path: "/questionnaire",
        metadata: { jurisdictions: ["NSW"] },
      });

      expect(prisma.$executeRaw).toHaveBeenCalled();
      const calls = vi.mocked(prisma.$executeRaw).mock.calls;
      expect(calls.length).toBeGreaterThanOrEqual(1);
    });
  });
});

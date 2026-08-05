import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/usage/route";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { websiteUsageService } from "@/server/services/websiteUsageService";

vi.mock("@/server/middleware/authMiddleware", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/server/services/websiteUsageService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/services/websiteUsageService")>();
  return {
    ...actual,
    websiteUsageService: {
      recordEvent: vi.fn(),
      getSummary: vi.fn(),
    },
  };
});

describe("/api/usage", () => {
  beforeEach(() => {
    vi.mocked(websiteUsageService.recordEvent).mockReset();
    vi.mocked(websiteUsageService.getSummary).mockReset();
    vi.mocked(requireAdmin).mockReset();
  });

  it("records anonymous events with 204", async () => {
    vi.mocked(websiteUsageService.recordEvent).mockResolvedValue(undefined);

    const response = await POST(
      new Request("http://localhost/api/usage", {
        method: "POST",
        body: JSON.stringify({ eventType: "page_view", path: "/" }),
      }),
    );

    expect(response.status).toBe(204);
  });

  it("returns 400 when recording fails validation", async () => {
    vi.mocked(websiteUsageService.recordEvent).mockRejectedValue(
      new Error("eventType is not supported"),
    );

    const response = await POST(
      new Request("http://localhost/api/usage", {
        method: "POST",
        body: JSON.stringify({ eventType: "click", path: "/" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "eventType is not supported",
    });
  });

  it("requires admin for GET summaries", async () => {
    vi.mocked(requireAdmin).mockReturnValue({
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    } as never);

    const response = await GET(new Request("http://localhost/api/usage"));
    expect(response.status).toBe(401);
  });

  it("passes period days through to the usage summary", async () => {
    vi.mocked(requireAdmin).mockReturnValue({
      session: { username: "admin", exp: Date.now() + 1000 },
    } as never);
    vi.mocked(websiteUsageService.getSummary).mockResolvedValue({
      periodDays: 90,
      totals: {
        pageViews: 1,
        questionnaireStarts: 1,
        questionnaireCompletions: 1,
        completionRate: 100,
      },
      dailyPageViews: [],
      dailyUsage: [],
      jurisdictionSelections: [],
      contextSelections: [],
      topPages: [],
      recentEvents: [],
    });

    const response = await GET(new Request("http://localhost/api/usage?days=90"));

    expect(response.status).toBe(200);
    expect(websiteUsageService.getSummary).toHaveBeenCalledWith(90);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/server/services/sessionService";

const serviceMock = vi.hoisted(() => ({
  getAnonymousFeedbackSummary: vi.fn(),
}));

vi.mock("@/server/services/feedbackService", () => ({
  feedbackService: serviceMock,
}));

import { GET } from "@/app/api/admin/feedback/route";

const summary = {
  totalResponses: 1,
  averageRating: 5,
  ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 },
  recentResponses: [],
};

describe("GET /api/admin/feedback (CAKE-15)", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_USERNAME", "admin");
    vi.stubEnv("ADMIN_PASSWORD", "secret-pass");
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
    serviceMock.getAnonymousFeedbackSummary.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects unauthenticated requests without reading survey data", async () => {
    const response = await GET(new Request("http://localhost/api/admin/feedback"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(serviceMock.getAnonymousFeedbackSummary).not.toHaveBeenCalled();
  });

  it("returns survey data to an authenticated administrator", async () => {
    serviceMock.getAnonymousFeedbackSummary.mockResolvedValue(summary);
    const token = createSessionToken("admin");
    const request = new Request("http://localhost/api/admin/feedback", {
      headers: {
        cookie: `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
      },
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(summary);
    expect(serviceMock.getAnonymousFeedbackSummary).toHaveBeenCalledOnce();
  });
});

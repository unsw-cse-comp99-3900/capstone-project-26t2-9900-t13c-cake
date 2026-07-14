import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const serviceMock = vi.hoisted(() => {
  class FeedbackValidationError extends Error {}

  return {
    submitAnonymousFeedback: vi.fn(),
    FeedbackValidationError,
  };
});

vi.mock("@/server/services/feedbackService", () => ({
  feedbackService: serviceMock,
}));

import { POST } from "@/app/api/feedback/route";

function createRequest(body: unknown) {
  return new Request("http://localhost/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/feedback (CAKE-15)", () => {
  beforeEach(() => {
    serviceMock.submitAnonymousFeedback.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 201 with the stored anonymous response", async () => {
    const saved = {
      id: "feedback-1",
      rating: 5,
      partOfTool: "Results",
      workedWell: "Clear guidance",
      improvement: null,
      createdAt: new Date("2026-07-14T04:00:00.000Z"),
    };
    serviceMock.submitAnonymousFeedback.mockResolvedValue(saved);

    const response = await POST(createRequest({ rating: 5, consentConfirmed: true }));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      ...saved,
      createdAt: "2026-07-14T04:00:00.000Z",
    });
  });

  it("returns 400 when service validation fails", async () => {
    serviceMock.submitAnonymousFeedback.mockRejectedValue(
      new serviceMock.FeedbackValidationError("Please choose a rating from 1 to 5."),
    );

    const response = await POST(createRequest({ rating: 0, consentConfirmed: true }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Please choose a rating from 1 to 5.",
    });
  });

  it("returns a safe 500 response for unexpected storage errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    serviceMock.submitAnonymousFeedback.mockRejectedValue(new Error("database unavailable"));

    const response = await POST(createRequest({ rating: 5, consentConfirmed: true }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Unable to submit feedback" });
  });
});

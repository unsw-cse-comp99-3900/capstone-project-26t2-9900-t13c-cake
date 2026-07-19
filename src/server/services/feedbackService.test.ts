import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  feedbackRepository,
  type AnonymousFeedbackDTO,
} from "@/server/repositories/feedbackRepository";
import { feedbackService } from "@/server/services/feedbackService";

vi.mock("@/server/repositories/feedbackRepository", () => ({
  feedbackRepository: {
    create: vi.fn(),
    findRecent: vi.fn(),
  },
}));

const savedFeedback: AnonymousFeedbackDTO = {
  id: "feedback-1",
  rating: 5,
  partOfTool: "Results",
  workedWell: "Clear guidance",
  improvement: null,
  createdAt: new Date("2026-07-14T04:00:00.000Z"),
};

describe("feedbackService (CAKE-15)", () => {
  beforeEach(() => {
    vi.mocked(feedbackRepository.create).mockReset();
    vi.mocked(feedbackRepository.findRecent).mockReset();
  });

  it("normalises and stores a valid anonymous submission", async () => {
    vi.mocked(feedbackRepository.create).mockResolvedValue(savedFeedback);

    await expect(
      feedbackService.submitAnonymousFeedback({
        rating: "5",
        partOfTool: " Results ",
        workedWell: " Clear guidance ",
        improvement: "   ",
        consentConfirmed: true,
      }),
    ).resolves.toEqual(savedFeedback);

    expect(feedbackRepository.create).toHaveBeenCalledWith({
      rating: 5,
      partOfTool: "Results",
      workedWell: "Clear guidance",
      improvement: null,
      consentConfirmed: true,
    });
  });

  it.each([undefined, 0, 6, 2.5, "invalid"])(
    "rejects an invalid rating: %s",
    async (rating) => {
      await expect(
        feedbackService.submitAnonymousFeedback({
          rating,
          consentConfirmed: true,
        }),
      ).rejects.toThrow("Please choose a rating from 1 to 5.");

      expect(feedbackRepository.create).not.toHaveBeenCalled();
    },
  );

  it("requires confirmation of the anonymous feedback notice", async () => {
    await expect(
      feedbackService.submitAnonymousFeedback({ rating: 4 }),
    ).rejects.toThrow("Please confirm the anonymous feedback notice.");
  });

  it("rejects tool areas that are not offered by the form", async () => {
    await expect(
      feedbackService.submitAnonymousFeedback({
        rating: 4,
        partOfTool: "Admin portal",
        consentConfirmed: true,
      }),
    ).rejects.toThrow("Please choose a valid tool area.");
  });

  it.each([
    "Please email me at visitor@example.com",
    "Please call +61 412 345 678",
  ])("rejects contact details in free-text answers", async (workedWell) => {
    await expect(
      feedbackService.submitAnonymousFeedback({
        rating: 4,
        workedWell,
        consentConfirmed: true,
      }),
    ).rejects.toThrow("Please remove contact details");

    expect(feedbackRepository.create).not.toHaveBeenCalled();
  });

  it("rejects free-text answers over the maximum length", async () => {
    await expect(
      feedbackService.submitAnonymousFeedback({
        rating: 4,
        improvement: "a".repeat(801),
        consentConfirmed: true,
      }),
    ).rejects.toThrow("What could be improved is too long.");
  });

  it("builds rating totals and averages from stored responses", async () => {
    const responses: AnonymousFeedbackDTO[] = [
      savedFeedback,
      {
        ...savedFeedback,
        id: "feedback-2",
        rating: 4,
        createdAt: new Date("2026-07-13T04:00:00.000Z"),
      },
      {
        ...savedFeedback,
        id: "feedback-3",
        rating: 2,
        createdAt: new Date("2026-07-12T04:00:00.000Z"),
      },
    ];
    vi.mocked(feedbackRepository.findRecent).mockResolvedValue(responses);

    await expect(feedbackService.getAnonymousFeedbackSummary()).resolves.toEqual({
      totalResponses: 3,
      averageRating: 3.7,
      ratingCounts: { 1: 0, 2: 1, 3: 0, 4: 1, 5: 1 },
      recentResponses: responses,
    });
    expect(feedbackRepository.findRecent).toHaveBeenCalledWith(100);
  });

  it("returns an empty summary when no feedback has been stored", async () => {
    vi.mocked(feedbackRepository.findRecent).mockResolvedValue([]);

    await expect(feedbackService.getAnonymousFeedbackSummary()).resolves.toEqual({
      totalResponses: 0,
      averageRating: null,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recentResponses: [],
    });
  });
});

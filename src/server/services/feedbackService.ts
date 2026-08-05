import {
  feedbackRepository,
  type AnonymousFeedbackCreateInput,
  type AnonymousFeedbackDTO,
} from "@/server/repositories/feedbackRepository";

const allowedParts = new Set([
  "Landing page",
  "Questionnaire",
  "Results",
  "Privacy information",
  "General experience",
]);

const contactPattern =
  /(?:[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\+?\d[\d\s().-]{7,}\d)/i;

export type AnonymousFeedbackSummary = {
  totalResponses: number;
  averageRating: number | null;
  ratingCounts: Record<number, number>;
  recentResponses: AnonymousFeedbackDTO[];
};

class FeedbackValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedbackValidationError";
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new FeedbackValidationError("Feedback must be submitted as a form object.");
  }
  return value as Record<string, unknown>;
}

function normaliseText(value: unknown, maxLength: number, fieldLabel: string): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value !== "string") {
    throw new FeedbackValidationError(`${fieldLabel} must be text.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.length > maxLength) {
    throw new FeedbackValidationError(`${fieldLabel} is too long.`);
  }
  if (contactPattern.test(trimmed)) {
    throw new FeedbackValidationError(
      "Please remove contact details before submitting anonymous feedback.",
    );
  }
  return trimmed;
}

function parseSubmission(payload: unknown): AnonymousFeedbackCreateInput {
  const data = asRecord(payload);
  const rating = Number(data.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new FeedbackValidationError("Please choose a rating from 1 to 5.");
  }

  if (data.consentConfirmed !== true) {
    throw new FeedbackValidationError("Please confirm the anonymous feedback notice.");
  }

  const partOfTool = normaliseText(data.partOfTool, 80, "Tool area");
  if (partOfTool && !allowedParts.has(partOfTool)) {
    throw new FeedbackValidationError("Please choose a valid tool area.");
  }

  return {
    rating,
    partOfTool,
    workedWell: normaliseText(data.workedWell, 800, "What worked well"),
    improvement: normaliseText(data.improvement, 800, "What could be improved"),
    consentConfirmed: true,
  };
}

function buildSummary(responses: AnonymousFeedbackDTO[]): AnonymousFeedbackSummary {
  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingTotal = 0;

  for (const response of responses) {
    ratingCounts[response.rating] = (ratingCounts[response.rating] ?? 0) + 1;
    ratingTotal += response.rating;
  }

  return {
    totalResponses: responses.length,
    averageRating: responses.length > 0 ? Number((ratingTotal / responses.length).toFixed(1)) : null,
    ratingCounts,
    recentResponses: responses,
  };
}

/** Layer 3 — validate and store anonymous public feedback (CAKE-13). */
export const feedbackService = {
  FeedbackValidationError,

  async submitAnonymousFeedback(payload: unknown): Promise<AnonymousFeedbackDTO> {
    const data = parseSubmission(payload);
    return feedbackRepository.create(data);
  },

  async getAnonymousFeedbackSummary(): Promise<AnonymousFeedbackSummary> {
    const responses = await feedbackRepository.findRecent(100);
    return buildSummary(responses);
  },
};

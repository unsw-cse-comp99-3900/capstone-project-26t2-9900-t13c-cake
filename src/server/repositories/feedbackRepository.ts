import type { AnonymousFeedback } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export type AnonymousFeedbackCreateInput = {
  rating: number;
  partOfTool: string | null;
  workedWell: string | null;
  improvement: string | null;
  consentConfirmed: boolean;
};

export type AnonymousFeedbackDTO = Omit<AnonymousFeedback, "consentConfirmed">;

function toDTO(record: AnonymousFeedback): AnonymousFeedbackDTO {
  // Consent is enforced at submission time; it does not need to be shown in the admin list.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { consentConfirmed, ...dto } = record;
  return dto;
}

/** Layer 4 — persist anonymous feedback without exposing consent in list DTOs (CAKE-13). */
export const feedbackRepository = {
  async create(data: AnonymousFeedbackCreateInput): Promise<AnonymousFeedbackDTO> {
    const record = await prisma.anonymousFeedback.create({ data });
    return toDTO(record);
  },

  async findRecent(limit = 50): Promise<AnonymousFeedbackDTO[]> {
    const records = await prisma.anonymousFeedback.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return records.map(toDTO);
  },
};

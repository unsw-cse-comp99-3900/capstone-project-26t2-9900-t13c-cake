import type { AnonymousFeedback } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { feedbackRepository } from "@/server/repositories/feedbackRepository";

const prismaMock = vi.hoisted(() => ({
  create: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    anonymousFeedback: {
      create: prismaMock.create,
      findMany: prismaMock.findMany,
    },
  },
}));

const record: AnonymousFeedback = {
  id: "feedback-1",
  rating: 5,
  partOfTool: "Results",
  workedWell: "Clear guidance",
  improvement: null,
  consentConfirmed: true,
  createdAt: new Date("2026-07-14T04:00:00.000Z"),
};

describe("feedbackRepository (CAKE-15)", () => {
  beforeEach(() => {
    prismaMock.create.mockReset();
    prismaMock.findMany.mockReset();
  });

  it("creates an anonymous feedback row through Prisma", async () => {
    prismaMock.create.mockResolvedValue(record);
    const input = {
      rating: 5,
      partOfTool: "Results",
      workedWell: "Clear guidance",
      improvement: null,
      consentConfirmed: true,
    };

    await expect(feedbackRepository.create(input)).resolves.toEqual({
      id: record.id,
      rating: record.rating,
      partOfTool: record.partOfTool,
      workedWell: record.workedWell,
      improvement: record.improvement,
      createdAt: record.createdAt,
    });
    expect(prismaMock.create).toHaveBeenCalledWith({ data: input });
  });

  it("returns recent responses without exposing the consent field", async () => {
    prismaMock.findMany.mockResolvedValue([record]);

    await expect(feedbackRepository.findRecent(25)).resolves.toEqual([
      {
        id: record.id,
        rating: record.rating,
        partOfTool: record.partOfTool,
        workedWell: record.workedWell,
        improvement: record.improvement,
        createdAt: record.createdAt,
      },
    ]);
    expect(prismaMock.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      take: 25,
    });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { evidenceService } from "@/server/services/evidenceService";
import { evidenceRepository } from "@/server/repositories/evidenceRepository";
import { validationService } from "@/server/services/validationService";

vi.mock("@/server/repositories/evidenceRepository", () => ({
  evidenceRepository: {
    findAllActive: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    bulkUpsert: vi.fn(),
  },
}));

vi.mock("@/server/services/validationService", () => ({
  validationService: {
    validateEvidencePayload: vi.fn(),
  },
}));

const sampleRecord = {
  id: "rec-1",
  publisher: "NSW Health",
  title: "Guidance",
  year: 2024,
  link: null,
  jurisdictions: "NSW",
  context: "Research",
  subCategory: null,
  engagementLevel: "3",
  minHourlyRate: 40,
  maxHourlyRate: 60,
  reimbursementGuidance: true,
  unpaidEngagementGuidance: false,
  exampleOrganisations: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
};

describe("evidenceService", () => {
  beforeEach(() => {
    vi.mocked(evidenceRepository.findAllActive).mockReset();
    vi.mocked(evidenceRepository.create).mockReset();
    vi.mocked(evidenceRepository.update).mockReset();
    vi.mocked(evidenceRepository.softDelete).mockReset();
    vi.mocked(evidenceRepository.bulkUpsert).mockReset();
    vi.mocked(validationService.validateEvidencePayload).mockReset();
  });

  it("lists active evidence from the repository", async () => {
    vi.mocked(evidenceRepository.findAllActive).mockResolvedValue([sampleRecord]);

    await expect(evidenceService.listPublicEvidence()).resolves.toEqual([sampleRecord]);
  });

  it("validates payloads before create and update", async () => {
    const validated = { publisher: "NSW Health", title: "Guidance" };
    vi.mocked(validationService.validateEvidencePayload).mockReturnValue(validated as never);
    vi.mocked(evidenceRepository.create).mockResolvedValue(sampleRecord);
    vi.mocked(evidenceRepository.update).mockResolvedValue(sampleRecord);

    await evidenceService.createEvidence({ publisher: "NSW Health" });
    await evidenceService.updateEvidence("rec-1", { publisher: "NSW Health" });

    expect(validationService.validateEvidencePayload).toHaveBeenCalledTimes(2);
    expect(evidenceRepository.create).toHaveBeenCalledWith(validated);
    expect(evidenceRepository.update).toHaveBeenCalledWith("rec-1", validated);
  });

  it("does not call the repository when validation fails", async () => {
    vi.mocked(validationService.validateEvidencePayload).mockImplementation(() => {
      throw new Error("title is required");
    });

    await expect(evidenceService.createEvidence({})).rejects.toThrow("title is required");
    expect(evidenceRepository.create).not.toHaveBeenCalled();
  });

  it("soft-deletes and applies excel imports via the repository", async () => {
    vi.mocked(evidenceRepository.softDelete).mockResolvedValue(undefined);
    vi.mocked(evidenceRepository.bulkUpsert).mockResolvedValue({
      createdCount: 1,
      updatedCount: 0,
    });

    await evidenceService.deleteEvidence("rec-1");
    await expect(evidenceService.applyExcelImport([{ id: "" } as never])).resolves.toEqual({
      createdCount: 1,
      updatedCount: 0,
    });

    expect(evidenceRepository.softDelete).toHaveBeenCalledWith("rec-1");
    expect(evidenceRepository.bulkUpsert).toHaveBeenCalled();
  });
});

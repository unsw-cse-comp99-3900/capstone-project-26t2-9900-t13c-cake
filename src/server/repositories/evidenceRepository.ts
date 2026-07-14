import type { EvidenceRecord } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { EvidencePayload } from "@/server/services/validationService";

export type EvidenceRecordDTO = Omit<EvidenceRecord, "deletedAt">;
export type EvidenceImportRow = Omit<EvidenceRecord, "createdAt" | "updatedAt" | "deletedAt">;
export type BulkImportResult = {
  createdCount: number;
  updatedCount: number;
};

export class EvidenceImportConflictError extends Error {
  constructor(id: string) {
    super(`No active EvidenceRecord found for id "${id}"`);
    this.name = "EvidenceImportConflictError";
  }
}

function toDTO(record: EvidenceRecord): EvidenceRecordDTO {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { deletedAt, ...dto } = record;
  return dto;
}

function toPersistenceData(row: EvidenceImportRow) {
  return {
    publisher: row.publisher,
    title: row.title,
    year: row.year,
    link: row.link,
    jurisdictions: row.jurisdictions,
    context: row.context,
    subCategory: row.subCategory,
    engagementLevel: row.engagementLevel,
    minHourlyRate: row.minHourlyRate,
    maxHourlyRate: row.maxHourlyRate,
    reimbursementGuidance: row.reimbursementGuidance,
    unpaidEngagementGuidance: row.unpaidEngagementGuidance,
    exampleOrganisations: row.exampleOrganisations,
  };
}

/** Layer 4 — EvidenceRepository */
export const evidenceRepository = {
  async findAllActive(): Promise<EvidenceRecordDTO[]> {
    const records = await prisma.evidenceRecord.findMany({
      where: { deletedAt: null },
      orderBy: [{ year: "desc" }, { publisher: "asc" }],
    });
    return records.map(toDTO);
  },

  async findById(id: string): Promise<EvidenceRecordDTO | null> {
    const record = await prisma.evidenceRecord.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? toDTO(record) : null;
  },

  async create(data: EvidencePayload): Promise<EvidenceRecordDTO> {
    const record = await prisma.evidenceRecord.create({ data });
    return toDTO(record);
  },

  async update(id: string, data: EvidencePayload): Promise<EvidenceRecordDTO> {
    const record = await prisma.evidenceRecord.update({
      where: { id },
      data,
    });
    return toDTO(record);
  },

  async softDelete(id: string): Promise<void> {
    await prisma.evidenceRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async bulkUpsert(rows: EvidenceImportRow[]): Promise<BulkImportResult> {
    return prisma.$transaction(async (tx) => {
      let createdCount = 0;
      let updatedCount = 0;

      for (const row of rows) {
        const data = toPersistenceData(row);

        if (row.id.trim() === "") {
          await tx.evidenceRecord.create({ data });
          createdCount += 1;
          continue;
        }

        const result = await tx.evidenceRecord.updateMany({
          where: { id: row.id, deletedAt: null },
          data,
        });

        if (result.count !== 1) {
          throw new EvidenceImportConflictError(row.id);
        }

        updatedCount += 1;
      }

      return { createdCount, updatedCount };
    });
  },
};

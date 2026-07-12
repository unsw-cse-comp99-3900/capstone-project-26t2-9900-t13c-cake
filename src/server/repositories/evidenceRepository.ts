import type { EvidenceRecord } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { EvidencePayload } from "@/server/services/validationService";

export type EvidenceRecordDTO = Omit<EvidenceRecord, "deletedAt">;

function toDTO(record: EvidenceRecord): EvidenceRecordDTO {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { deletedAt, ...dto } = record;
  return dto;
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

  async bulkUpsert(_rows: unknown[]): Promise<void> {
    void _rows;
    throw new Error("Not implemented");
  },
};

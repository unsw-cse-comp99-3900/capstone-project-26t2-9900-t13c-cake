import type { EvidenceRecord } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

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

  async create(_data: unknown): Promise<EvidenceRecordDTO> {
    throw new Error("Not implemented");
  },

  async update(_id: string, _data: unknown): Promise<EvidenceRecordDTO> {
    throw new Error("Not implemented");
  },

  async softDelete(_id: string): Promise<void> {
    throw new Error("Not implemented");
  },

  async bulkUpsert(_rows: unknown[]): Promise<void> {
    throw new Error("Not implemented");
  },
};

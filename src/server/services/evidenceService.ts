import {
  evidenceRepository,
  type BulkImportResult,
  type EvidenceImportRow,
  type EvidenceRecordDTO,
} from "@/server/repositories/evidenceRepository";
import { validationService } from "@/server/services/validationService";

/** Layer 3 — EvidenceService */
export const evidenceService = {
  async listPublicEvidence(): Promise<EvidenceRecordDTO[]> {
    return evidenceRepository.findAllActive();
  },

  async listAllActiveEvidence(): Promise<EvidenceRecordDTO[]> {
    return evidenceRepository.findAllActive();
  },

  async createEvidence(payload: unknown): Promise<EvidenceRecordDTO> {
    const data = validationService.validateEvidencePayload(payload);
    return evidenceRepository.create(data);
  },

  async updateEvidence(id: string, payload: unknown): Promise<EvidenceRecordDTO> {
    const data = validationService.validateEvidencePayload(payload);
    return evidenceRepository.update(id, data);
  },

  async deleteEvidence(id: string): Promise<void> {
    await evidenceRepository.softDelete(id);
  },

  async applyExcelImport(rows: EvidenceImportRow[]): Promise<BulkImportResult> {
    return evidenceRepository.bulkUpsert(rows);
  },
};

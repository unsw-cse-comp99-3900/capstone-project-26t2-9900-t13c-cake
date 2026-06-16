import { evidenceRepository, type EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";

/** Layer 3 — EvidenceService */
export const evidenceService = {
  async listPublicEvidence(): Promise<EvidenceRecordDTO[]> {
    return evidenceRepository.findAllActive();
  },
};

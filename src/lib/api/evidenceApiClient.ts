import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";

/** CAKE-4 — fetches GET /api/evidence */
export async function fetchEvidenceRecords(): Promise<EvidenceRecordDTO[]> {
  const response = await fetch("/api/evidence");
  if (!response.ok) {
    throw new Error("Failed to load evidence records");
  }
  return response.json() as Promise<EvidenceRecordDTO[]>;
}

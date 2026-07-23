import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";

export type EvidenceTranslation = {
  id: string;
  publisher: string;
  title: string;
  exampleOrganisations: string | null;
};

export async function translateEvidenceRecords(
  records: EvidenceRecordDTO[],
  signal?: AbortSignal,
): Promise<EvidenceTranslation[]> {
  const batches = Array.from(
    { length: Math.ceil(records.length / 40) },
    (_, index) => records.slice(index * 40, index * 40 + 40),
  );
  const translatedBatches = await Promise.all(batches.map(async (batch) => {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetLanguage: "zh-CN",
        items: batch.map(({ id, updatedAt, publisher, title, exampleOrganisations }) => ({
          id,
          updatedAt,
          publisher,
          title,
          exampleOrganisations,
        })),
      }),
      signal,
    });
    if (!response.ok) throw new Error("Translation request failed");
    const body = await response.json() as { translations: EvidenceTranslation[] };
    return body.translations;
  }));
  return translatedBatches.flat();
}

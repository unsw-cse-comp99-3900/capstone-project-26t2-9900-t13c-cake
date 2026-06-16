import { NextResponse } from "next/server";
import { evidenceService } from "@/server/services/evidenceService";

/** EvidenceReadController — GET /api/evidence (public, CAKE-2) */
export async function GET() {
  try {
    const records = await evidenceService.listPublicEvidence();
    return NextResponse.json(records);
  } catch (error) {
    console.error("[GET /api/evidence]", error);
    return NextResponse.json({ error: "Unable to load evidence records" }, { status: 500 });
  }
}

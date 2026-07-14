import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";
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

/** EvidenceWriteController — POST /api/evidence (admin, CAKE-11) */
export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = await request.json();
    const record = await evidenceService.createEvidence(payload);
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create evidence record";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

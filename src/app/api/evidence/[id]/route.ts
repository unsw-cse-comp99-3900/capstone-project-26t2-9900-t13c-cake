import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { evidenceService } from "@/server/services/evidenceService";

type EvidenceRecordRouteContext = {
  params: Promise<{ id: string }>;
};

/** EvidenceWriteController — PUT /api/evidence/:id (admin, CAKE-11) */
export async function PUT(request: Request, context: EvidenceRecordRouteContext) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const { id } = await context.params;
    const payload = await request.json();
    const record = await evidenceService.updateEvidence(id, payload);
    return NextResponse.json(record);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update evidence record";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** EvidenceWriteController — DELETE /api/evidence/:id (admin, CAKE-11) */
export async function DELETE(request: Request, context: EvidenceRecordRouteContext) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const { id } = await context.params;
    await evidenceService.deleteEvidence(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete evidence record" }, { status: 400 });
  }
}

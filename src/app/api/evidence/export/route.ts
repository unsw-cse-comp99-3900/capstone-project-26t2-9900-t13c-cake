import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";

/** ImportExportController — GET /api/evidence/export (CAKE-12) */
export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

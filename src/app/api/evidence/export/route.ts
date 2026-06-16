import { NextResponse } from "next/server";

/** ImportExportController — GET /api/evidence/export (CAKE-12) */
export async function GET() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

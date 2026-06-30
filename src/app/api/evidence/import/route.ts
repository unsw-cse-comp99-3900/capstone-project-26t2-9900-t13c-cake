import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";

/** ImportExportController — POST /api/evidence/import (CAKE-12) */
export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { backupRecoveryService } from "@/server/services/backupRecoveryService";

/** AuthController — POST /api/auth/recovery/backup/generate (CAKE-10). */
export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  const result = await backupRecoveryService.generate();
  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}

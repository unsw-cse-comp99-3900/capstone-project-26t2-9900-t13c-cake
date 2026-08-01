import { NextResponse } from "next/server";
import { authService } from "@/server/services/authService";
import { backupRecoveryService } from "@/server/services/backupRecoveryService";

function jsonNoStore(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/** AuthController — GET /api/auth/session (CAKE-10) */
export async function GET(request: Request) {
  if (!authService.isConfigured()) {
    return jsonNoStore(
      { authenticated: false, configured: false },
      503,
    );
  }

  const session = authService.getSessionFromRequest(request);
  if (!session) {
    return jsonNoStore({ authenticated: false, configured: true });
  }

  const recoveryStatus = await backupRecoveryService.getStatus();

  return jsonNoStore({
    authenticated: true,
    configured: true,
    username: session.username,
    backupRecoverySetupRequired: recoveryStatus?.setupRequired ?? true,
  });
}

import { NextResponse } from "next/server";
import { authService } from "@/server/services/authService";
import type { AdminSessionPayload } from "@/server/services/sessionService";

/** AuthMiddleware — gate admin write routes (CAKE-10) */
export function getAdminSession(request: Request): AdminSessionPayload | null {
  return authService.getSessionFromRequest(request);
}

export function requireAdmin(request: Request):
  | { session: AdminSessionPayload }
  | { response: NextResponse } {
  if (!authService.isConfigured()) {
    return {
      response: NextResponse.json(
        { error: "Admin authentication is not configured" },
        { status: 503 },
      ),
    };
  }

  const session = getAdminSession(request);
  if (!session) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session };
}

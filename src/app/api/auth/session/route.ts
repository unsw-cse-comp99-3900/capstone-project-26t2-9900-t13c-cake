import { NextResponse } from "next/server";
import { authService } from "@/server/services/authService";

/** AuthController — GET /api/auth/session (CAKE-10) */
export async function GET(request: Request) {
  if (!authService.isConfigured()) {
    return NextResponse.json(
      { authenticated: false, configured: false },
      { status: 503 },
    );
  }

  const session = authService.getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ authenticated: false, configured: true });
  }

  return NextResponse.json({
    authenticated: true,
    configured: true,
    username: session.username,
  });
}

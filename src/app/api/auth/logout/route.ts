import { NextResponse } from "next/server";
import { authService } from "@/server/services/authService";

/** AuthController — POST /api/auth/logout (CAKE-10) */
export async function POST() {
  const response = NextResponse.json({ authenticated: false });
  const cookie = authService.getSessionCookieOptions();

  response.cookies.set(cookie.name, "", {
    httpOnly: cookie.httpOnly,
    sameSite: cookie.sameSite,
    secure: cookie.secure,
    maxAge: 0,
    path: cookie.path,
  });

  return response;
}

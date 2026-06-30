import { NextResponse } from "next/server";
import { authService } from "@/server/services/authService";

type LoginBody = {
  username?: string;
  password?: string;
};

/** AuthController — POST /api/auth/login (CAKE-10) */
export async function POST(request: Request) {
  if (!authService.isConfigured()) {
    return NextResponse.json(
      { error: "Admin authentication is not configured" },
      { status: 503 },
    );
  }

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const isValid = await authService.verifyCredentials(username, password);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = authService.createSessionToken(username);
  const response = NextResponse.json({ authenticated: true, username });
  const cookie = authService.getSessionCookieOptions();

  response.cookies.set(cookie.name, token, {
    httpOnly: cookie.httpOnly,
    sameSite: cookie.sameSite,
    secure: cookie.secure,
    maxAge: cookie.maxAge,
    path: cookie.path,
  });

  return response;
}

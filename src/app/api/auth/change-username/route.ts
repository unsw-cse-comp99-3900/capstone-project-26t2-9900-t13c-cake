import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { authService } from "@/server/services/authService";

type ChangeUsernameBody = {
  currentPassword?: string;
  newUsername?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_PASSWORD: "Current password is incorrect.",
  INVALID_USERNAME: "Username must be 3–32 characters and use letters, numbers, dots, dashes, or underscores.",
  USERNAME_UNCHANGED: "Choose a username that is different from your current one.",
  NOT_CONFIGURED: "Administrator account is not configured.",
};

/** AuthController — POST /api/auth/change-username (CAKE-10) */
export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  let body: ChangeUsernameBody;
  try {
    body = (await request.json()) as ChangeUsernameBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const currentPassword = body.currentPassword ?? "";
  const newUsername = body.newUsername ?? "";

  if (!currentPassword || !newUsername.trim()) {
    return NextResponse.json(
      { error: "Current password and new username are required." },
      { status: 400 },
    );
  }

  const result = await authService.changeUsername(currentPassword, newUsername);
  if (!result.ok) {
    return NextResponse.json(
      { error: ERROR_MESSAGES[result.error] ?? "Unable to update username." },
      { status: 400 },
    );
  }

  const token = authService.createSessionToken(result.username);
  const response = NextResponse.json({
    authenticated: true,
    username: result.username,
  });
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

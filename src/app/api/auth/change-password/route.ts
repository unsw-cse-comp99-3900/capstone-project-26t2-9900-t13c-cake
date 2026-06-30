import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { authService } from "@/server/services/authService";

type ChangePasswordBody = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_PASSWORD: "Current password is incorrect.",
  INVALID_NEW_PASSWORD: "New password must be 8–128 characters.",
  PASSWORD_UNCHANGED: "Choose a password that is different from your current one.",
  NOT_CONFIGURED: "Administrator account is not configured.",
};

function applySessionCookie(response: NextResponse, username: string) {
  const token = authService.createSessionToken(username);
  const cookie = authService.getSessionCookieOptions();

  response.cookies.set(cookie.name, token, {
    httpOnly: cookie.httpOnly,
    sameSite: cookie.sameSite,
    secure: cookie.secure,
    maxAge: cookie.maxAge,
    path: cookie.path,
  });
}

/** AuthController — POST /api/auth/change-password (CAKE-10) */
export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  let body: ChangePasswordBody;
  try {
    body = (await request.json()) as ChangePasswordBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const currentPassword = body.currentPassword ?? "";
  const newPassword = body.newPassword ?? "";
  const confirmPassword = body.confirmPassword ?? "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json(
      { error: "Current password, new password, and confirmation are required." },
      { status: 400 },
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "New password and confirmation do not match." }, { status: 400 });
  }

  const result = await authService.changePassword(currentPassword, newPassword);
  if (!result.ok) {
    return NextResponse.json(
      { error: ERROR_MESSAGES[result.error] ?? "Unable to update password." },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ authenticated: true, username: auth.session.username });
  applySessionCookie(response, auth.session.username);
  return response;
}

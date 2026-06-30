import { NextResponse } from "next/server";
import { authService } from "@/server/services/authService";

type ResetPasswordBody = {
  recoveryCode?: string;
  newUsername?: string;
  newPassword?: string;
  confirmPassword?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  RECOVERY_NOT_CONFIGURED: "Password recovery is not configured for this environment.",
  INVALID_RECOVERY_CODE: "Recovery code is incorrect.",
  INVALID_USERNAME:
    "Username must be 3–32 characters and use letters, numbers, dots, dashes, or underscores.",
  INVALID_NEW_PASSWORD: "New password must be 8–128 characters.",
  NOT_CONFIGURED: "Administrator account is not configured.",
};

/** AuthController — POST /api/auth/reset-password (CAKE-10) */
export async function POST(request: Request) {
  let body: ResetPasswordBody;
  try {
    body = (await request.json()) as ResetPasswordBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const recoveryCode = body.recoveryCode ?? "";
  const newUsername = body.newUsername ?? "";
  const newPassword = body.newPassword ?? "";
  const confirmPassword = body.confirmPassword ?? "";

  if (!recoveryCode || !newUsername.trim() || !newPassword || !confirmPassword) {
    return NextResponse.json(
      { error: "Recovery code, new username, new password, and confirmation are required." },
      { status: 400 },
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "New password and confirmation do not match." }, { status: 400 });
  }

  const result = await authService.resetAccountWithRecovery(
    recoveryCode,
    newUsername,
    newPassword,
  );
  if (!result.ok) {
    const status = result.error === "RECOVERY_NOT_CONFIGURED" ? 503 : 400;
    return NextResponse.json(
      { error: ERROR_MESSAGES[result.error] ?? "Unable to reset administrator account." },
      { status },
    );
  }

  return NextResponse.json({ success: true, username: result.username });
}

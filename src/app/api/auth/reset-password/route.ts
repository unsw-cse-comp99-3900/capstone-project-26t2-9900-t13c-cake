import { NextResponse } from "next/server";
import { accountRecoveryService } from "@/server/services/accountRecoveryService";

type ResetPasswordBody = {
  verificationCode?: string;
  backupRecoveryCode?: string;
  newUsername?: string;
  newPassword?: string;
  confirmPassword?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_RECOVERY_CODE: "Recovery code is incorrect.",
  INVALID_USERNAME:
    "Username must be 3–32 characters and use letters, numbers, dots, dashes, or underscores.",
  INVALID_NEW_PASSWORD: "New password must be 8–128 characters.",
  RECOVERY_CODE_EXPIRED: "The recovery code has expired. Request a new code.",
  TOO_MANY_ATTEMPTS: "Too many incorrect attempts. Request a new recovery code.",
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

  const newUsername = body.newUsername ?? "";
  const newPassword = body.newPassword ?? "";
  const confirmPassword = body.confirmPassword ?? "";

  if (!newPassword || !confirmPassword) {
    return NextResponse.json(
      { error: "New password and confirmation are required." },
      { status: 400 },
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "New password and confirmation do not match." }, { status: 400 });
  }

  if (body.backupRecoveryCode !== undefined) {
    const result = await accountRecoveryService.resetPasswordWithBackupCode(
      body.backupRecoveryCode,
      newUsername,
      newPassword,
    );
    if (!result.ok) {
      return NextResponse.json(
        {
          error:
            result.error === "INVALID_RECOVERY_CODE"
              ? "Recovery code is invalid or unavailable."
              : ERROR_MESSAGES[result.error] ??
                "Unable to reset administrator password.",
        },
        {
          status: result.error === "NOT_CONFIGURED" ? 503 : 400,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    return NextResponse.json(
      { success: true, username: result.username },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  if (body.verificationCode === undefined) {
    return NextResponse.json(
      { error: "A verification code or backup recovery code is required." },
      { status: 400 },
    );
  }

  if (!newUsername.trim()) {
    return NextResponse.json({ error: "New username is required." }, { status: 400 });
  }

  const result = await accountRecoveryService.resetPassword(
    body.verificationCode,
    newUsername,
    newPassword,
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: ERROR_MESSAGES[result.error] ?? "Unable to reset administrator password." },
      { status: result.error === "NOT_CONFIGURED" ? 503 : 400 },
    );
  }

  return NextResponse.json({ success: true, username: result.username });
}

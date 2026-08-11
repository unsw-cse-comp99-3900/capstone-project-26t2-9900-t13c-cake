import { NextResponse } from "next/server";
import { accountRecoveryService } from "@/server/services/accountRecoveryService";

type VerifyBody = {
  verificationCode?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_RECOVERY_CODE: "Recovery code is incorrect.",
  RECOVERY_CODE_EXPIRED: "The recovery code has expired. Request a new code.",
  TOO_MANY_ATTEMPTS: "Too many incorrect attempts. Request a new recovery code.",
  NOT_CONFIGURED: "Administrator account is not configured.",
};

/** AuthController — POST /api/auth/recovery/verify (email OTP check before reset, CAKE-10). */
export async function POST(request: Request) {
  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const verificationCode = body.verificationCode ?? "";
  if (!verificationCode) {
    return NextResponse.json({ error: "Verification code is required." }, { status: 400 });
  }

  const result = await accountRecoveryService.verifyCode(verificationCode);
  if (!result.ok) {
    return NextResponse.json(
      { error: ERROR_MESSAGES[result.error] ?? "Unable to verify recovery code." },
      { status: result.error === "NOT_CONFIGURED" ? 503 : 400 },
    );
  }

  return NextResponse.json({ success: true });
}

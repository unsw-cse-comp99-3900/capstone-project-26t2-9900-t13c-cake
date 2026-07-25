import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { recoveryEmailVerificationService } from "@/server/services/recoveryEmailVerificationService";

type VerifyBody = {
  verificationCode?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_RECOVERY_CODE: "Verification code is incorrect.",
  RECOVERY_CODE_EXPIRED: "The verification code has expired. Request a new code.",
  TOO_MANY_ATTEMPTS: "Too many incorrect attempts. Request a new verification code.",
  NOT_CONFIGURED: "Administrator account is not configured.",
};

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let result;
  try {
    result = await recoveryEmailVerificationService.verifyCode(
      body.verificationCode ?? "",
    );
  } catch (error) {
    console.error("[recovery email verification] failed to verify code:", error);
    return NextResponse.json(
      { error: "Unable to verify the email address. Please try again later." },
      { status: 500 },
    );
  }

  if (!result.ok) {
    return NextResponse.json(
      { error: ERROR_MESSAGES[result.error] ?? "Unable to verify the email address." },
      { status: result.error === "NOT_CONFIGURED" ? 503 : 400 },
    );
  }

  return NextResponse.json({ ok: true, email: result.email });
}

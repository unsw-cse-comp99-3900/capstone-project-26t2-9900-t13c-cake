import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { recoveryEmailVerificationService } from "@/server/services/recoveryEmailVerificationService";

type RequestBody = {
  currentPassword?: string;
  email?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_PASSWORD: "Current password is incorrect.",
  INVALID_EMAIL: "Enter a valid recovery email address.",
  EMAIL_UNCHANGED: "Enter a different email address.",
  NOT_CONFIGURED: "Administrator account is not configured.",
  DELIVERY_NOT_CONFIGURED: "Email delivery is not configured.",
  DELIVERY_FAILED: "The verification code could not be delivered. Please try again later.",
  RATE_LIMITED: "Please wait before requesting another verification code.",
};

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.currentPassword) {
    return NextResponse.json({ error: "Current password is required." }, { status: 400 });
  }

  let result;
  try {
    result = await recoveryEmailVerificationService.requestCode(
      body.currentPassword,
      body.email ?? "",
    );
  } catch (error) {
    console.error("[recovery email verification] failed to request code:", error);
    return NextResponse.json(
      { error: "Unable to send verification code. Please try again later." },
      { status: 500 },
    );
  }

  if (!result.ok) {
    const status =
      result.error === "RATE_LIMITED"
        ? 429
        : result.error === "DELIVERY_FAILED"
          ? 502
          : result.error === "NOT_CONFIGURED" ||
              result.error === "DELIVERY_NOT_CONFIGURED"
            ? 503
            : 400;
    const response = NextResponse.json(
      {
        error: ERROR_MESSAGES[result.error] ?? "Unable to send verification code.",
        ...("retryAfter" in result ? { retryAfter: result.retryAfter } : {}),
      },
      { status },
    );
    if ("retryAfter" in result) {
      response.headers.set("Retry-After", String(result.retryAfter));
    }
    return response;
  }

  return NextResponse.json({
    ok: true,
    pendingEmail: result.pendingEmail,
    maskedDestination: result.maskedDestination,
    expiresInMinutes: result.expiresInMinutes,
  });
}

import { NextResponse } from "next/server";
import { accountRecoveryService } from "@/server/services/accountRecoveryService";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  NOT_CONFIGURED: "Administrator account is not configured.",
  DELIVERY_NOT_CONFIGURED: "Email recovery delivery is not configured.",
  CONTACT_NOT_CONFIGURED: "No recovery email is configured.",
  DELIVERY_FAILED: "The recovery code could not be delivered. Please try again later.",
  RATE_LIMITED: "Please wait before requesting another recovery code.",
};

/** AuthController — POST /api/auth/recovery/request (email OTP for password reset, CAKE-10). */
export async function POST() {
  try {
    const result = await accountRecoveryService.requestCode();
    if (!result.ok) {
      const status =
        result.error === "RATE_LIMITED"
          ? 429
          : result.error === "DELIVERY_FAILED"
            ? 502
            : 503;
      const response = NextResponse.json(
        {
          error: ERROR_MESSAGES[result.error] ?? "Unable to send recovery code.",
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
      maskedDestination: result.maskedDestination,
      expiresInMinutes: result.expiresInMinutes,
    });
  } catch (error) {
    console.error("[recovery/request]", error);
    return NextResponse.json(
      { error: "Unable to send recovery code. Please try again later." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { recoveryEmailVerificationService } from "@/server/services/recoveryEmailVerificationService";

const ERROR_MESSAGES: Record<string, string> = {
  NOT_CONFIGURED: "Administrator account is not configured.",
};

/** AuthController — GET /api/auth/recovery/contacts (recovery email status, CAKE-10). */
export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const status = await recoveryEmailVerificationService.getStatus();
    if (!status) {
      return NextResponse.json({ error: ERROR_MESSAGES.NOT_CONFIGURED }, { status: 503 });
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error("[recovery contacts] failed to load:", error);
    return NextResponse.json(
      { error: "Unable to load recovery email settings." },
      { status: 500 },
    );
  }
}

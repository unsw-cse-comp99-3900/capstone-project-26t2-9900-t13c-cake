import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { backupRecoveryService } from "@/server/services/backupRecoveryService";

type ConfirmBody = {
  createdAt?: string;
};

function jsonNoStore(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/** AuthController — POST /api/auth/recovery/backup/confirm (CAKE-10). */
export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  let body: ConfirmBody;
  try {
    body = (await request.json()) as ConfirmBody;
  } catch {
    return jsonNoStore({ error: "Invalid request body" }, 400);
  }

  const result = await backupRecoveryService.confirm(body.createdAt ?? "");
  if (!result.ok) {
    return jsonNoStore(
      { error: "Recovery code is unavailable. Generate a new code." },
      400,
    );
  }

  return jsonNoStore({ success: true });
}

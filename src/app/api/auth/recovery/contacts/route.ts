import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { adminAccountRepository } from "@/server/repositories/adminAccountRepository";

type UpdateContactsBody = {
  currentPassword?: string;
  email?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_PASSWORD: "Current password is incorrect.",
  INVALID_EMAIL: "Enter a valid email address.",
  NOT_CONFIGURED: "Administrator account is not configured.",
};

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  const contacts = await adminAccountRepository.getRecoveryContacts();
  if (!contacts) {
    return NextResponse.json({ error: ERROR_MESSAGES.NOT_CONFIGURED }, { status: 503 });
  }

  return NextResponse.json(contacts);
}

export async function PUT(request: Request) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  let body: UpdateContactsBody;
  try {
    body = (await request.json()) as UpdateContactsBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.currentPassword) {
    return NextResponse.json({ error: "Current password is required." }, { status: 400 });
  }

  const result = await adminAccountRepository.updateRecoveryContacts(
    body.currentPassword,
    body.email ?? "",
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: ERROR_MESSAGES[result.error] ?? "Unable to update recovery contacts." },
      { status: result.error === "NOT_CONFIGURED" ? 503 : 400 },
    );
  }

  return NextResponse.json(result.contacts);
}

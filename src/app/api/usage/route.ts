import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { websiteUsageService } from "@/server/services/websiteUsageService";

/** Anonymous usage write endpoint and admin-only usage summary. */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    await websiteUsageService.recordEvent(payload);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record usage event";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const summary = await websiteUsageService.getSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("[GET /api/usage]", error);
    return NextResponse.json({ error: "Unable to load website usage" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { feedbackService } from "@/server/services/feedbackService";

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  const summary = await feedbackService.getAnonymousFeedbackSummary();
  return NextResponse.json(summary);
}

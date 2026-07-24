import { NextResponse } from "next/server";
import { feedbackService } from "@/server/services/feedbackService";

/** FeedbackController — POST /api/feedback (public, CAKE-15) */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const feedback = await feedbackService.submitAnonymousFeedback(payload);
    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    if (error instanceof feedbackService.FeedbackValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("[POST /api/feedback]", error);
    return NextResponse.json({ error: "Unable to submit feedback" }, { status: 500 });
  }
}

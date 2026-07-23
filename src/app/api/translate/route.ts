import { NextResponse } from "next/server";
import { translationService } from "@/server/services/translationService";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { targetLanguage?: unknown; items?: unknown };
    if (body.targetLanguage !== "zh-CN") {
      return NextResponse.json({ error: "Unsupported target language" }, { status: 400 });
    }
    const items = translationService.validateItems(body.items);
    const translations = await translationService.translate(items);
    return NextResponse.json({ translations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to translate evidence";
    const status = message === "Translation service is not configured" ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

import { beforeEach, describe, expect, it, vi } from "vitest";

const service = vi.hoisted(() => ({
  validateItems: vi.fn(),
  translate: vi.fn(),
}));

vi.mock("@/server/services/translationService", () => ({
  translationService: service,
}));

import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/translate", () => {
  beforeEach(() => {
    service.validateItems.mockReset();
    service.translate.mockReset();
  });

  it("rejects unsupported languages", async () => {
    const response = await POST(request({ targetLanguage: "fr", items: [{}] }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Unsupported target language" });
  });

  it("returns translated evidence", async () => {
    const items = [{ id: "1", title: "Title" }];
    const translations = [{ id: "1", title: "标题" }];
    service.validateItems.mockReturnValue(items);
    service.translate.mockResolvedValue(translations);

    const response = await POST(request({ targetLanguage: "zh-CN", items }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ translations });
  });

  it("returns 503 when the server key is not configured", async () => {
    service.validateItems.mockReturnValue([{}]);
    service.translate.mockRejectedValue(new Error("Translation service is not configured"));
    const response = await POST(request({ targetLanguage: "zh-CN", items: [{}] }));
    expect(response.status).toBe(503);
  });
});

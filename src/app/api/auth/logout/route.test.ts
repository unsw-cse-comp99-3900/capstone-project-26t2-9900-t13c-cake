import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/auth/logout/route";
import { authService } from "@/server/services/authService";

vi.mock("@/server/services/authService", () => ({
  authService: {
    getSessionCookieOptions: vi.fn(() => ({
      name: "admin_session",
      maxAge: 3600,
      httpOnly: true,
      sameSite: "lax" as const,
      secure: false,
      path: "/",
    })),
  },
}));

describe("POST /api/auth/logout", () => {
  it("clears the session cookie", async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ authenticated: false });

    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("admin_session=");
    expect(setCookie).toMatch(/max-age=0/i);
    expect(authService.getSessionCookieOptions).toHaveBeenCalled();
  });
});

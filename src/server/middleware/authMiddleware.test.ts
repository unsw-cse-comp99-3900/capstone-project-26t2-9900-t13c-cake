import { describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/server/services/sessionService";

describe("authMiddleware (CAKE-10)", () => {
  it("returns 401 when no session cookie is present", () => {
    vi.stubEnv("ADMIN_USERNAME", "admin");
    vi.stubEnv("ADMIN_PASSWORD", "secret-pass");
    vi.stubEnv("SESSION_SECRET", "test-session-secret");

    const request = new Request("http://localhost/api/evidence/import", {
      method: "POST",
    });

    const result = requireAdmin(request);
    expect("response" in result).toBe(true);

    if ("response" in result) {
      expect(result.response).toBeInstanceOf(NextResponse);
      expect(result.response.status).toBe(401);
    }

    vi.unstubAllEnvs();
  });

  it("returns the session when a valid cookie is present", () => {
    vi.stubEnv("ADMIN_USERNAME", "admin");
    vi.stubEnv("ADMIN_PASSWORD", "secret-pass");
    vi.stubEnv("SESSION_SECRET", "test-session-secret");

    const token = createSessionToken("admin");
    const request = new Request("http://localhost/api/evidence/export", {
      headers: {
        cookie: `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
      },
    });

    const result = requireAdmin(request);
    expect("session" in result).toBe(true);

    if ("session" in result) {
      expect(result.session.username).toBe("admin");
    }

    vi.unstubAllEnvs();
  });
});

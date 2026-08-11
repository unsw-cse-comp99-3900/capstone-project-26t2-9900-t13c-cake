import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/auth/login/route";
import { authService } from "@/server/services/authService";
import { backupRecoveryService } from "@/server/services/backupRecoveryService";

vi.mock("@/server/services/authService", () => ({
  authService: {
    isConfigured: vi.fn(),
    verifyCredentials: vi.fn(),
    createSessionToken: vi.fn(),
    getSessionCookieOptions: vi.fn(),
  },
}));

vi.mock("@/server/services/backupRecoveryService", () => ({
  backupRecoveryService: {
    getStatus: vi.fn(),
  },
}));

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.mocked(authService.isConfigured).mockReturnValue(true);
    vi.mocked(authService.verifyCredentials).mockReset();
    vi.mocked(authService.createSessionToken).mockReturnValue("session-token");
    vi.mocked(authService.getSessionCookieOptions).mockReturnValue({
      name: "admin_session",
      maxAge: 3600,
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
    vi.mocked(backupRecoveryService.getStatus).mockReset();
  });

  it("returns 503 when auth is not configured", async () => {
    vi.mocked(authService.isConfigured).mockReturnValue(false);

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: "admin", password: "secret" }),
      }),
    );

    expect(response.status).toBe(503);
  });

  it("returns 400 for invalid JSON or missing credentials", async () => {
    const invalidJson = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: "{",
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(invalidJson.status).toBe(400);

    const missing = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: "admin" }),
      }),
    );
    expect(missing.status).toBe(400);
  });

  it("returns 401 for invalid credentials", async () => {
    vi.mocked(authService.verifyCredentials).mockResolvedValue(false);

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: "admin", password: "wrong" }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Invalid credentials" });
  });

  it("sets an httpOnly session cookie on success", async () => {
    vi.mocked(authService.verifyCredentials).mockResolvedValue(true);
    vi.mocked(backupRecoveryService.getStatus).mockResolvedValue({
      setupRequired: true,
      createdAt: null,
      confirmedAt: null,
    });

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: " admin ", password: "secret" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      authenticated: true,
      username: "admin",
      backupRecoverySetupRequired: true,
    });

    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("admin_session=");
    expect(setCookie.toLowerCase()).toContain("httponly");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as changePassword } from "@/app/api/auth/change-password/route";
import { POST as changeUsername } from "@/app/api/auth/change-username/route";
import { requireAdmin } from "@/server/middleware/authMiddleware";
import { authService } from "@/server/services/authService";

vi.mock("@/server/middleware/authMiddleware", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/server/services/authService", () => ({
  authService: {
    changePassword: vi.fn(),
    changeUsername: vi.fn(),
    createSessionToken: vi.fn(() => "new-token"),
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

describe("account change routes", () => {
  beforeEach(() => {
    vi.mocked(requireAdmin).mockReturnValue({
      session: { username: "admin", exp: Date.now() + 1000 },
    } as never);
    vi.mocked(authService.changePassword).mockReset();
    vi.mocked(authService.changeUsername).mockReset();
  });

  it("rejects unauthenticated password changes", async () => {
    vi.mocked(requireAdmin).mockReturnValue({
      response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    } as never);

    const response = await changePassword(
      new Request("http://localhost/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: "old-pass",
          newPassword: "new-pass1",
          confirmPassword: "new-pass1",
        }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("rejects password confirmation mismatches", async () => {
    const response = await changePassword(
      new Request("http://localhost/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: "old-pass",
          newPassword: "new-pass1",
          confirmPassword: "different",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "New password and confirmation do not match.",
    });
  });

  it("maps change-password service errors and refreshes the cookie on success", async () => {
    vi.mocked(authService.changePassword).mockResolvedValueOnce({
      ok: false,
      error: "INVALID_PASSWORD",
    });

    const failed = await changePassword(
      new Request("http://localhost/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: "wrong",
          newPassword: "new-pass1",
          confirmPassword: "new-pass1",
        }),
      }),
    );
    expect(failed.status).toBe(400);

    vi.mocked(authService.changePassword).mockResolvedValueOnce({ ok: true });
    const success = await changePassword(
      new Request("http://localhost/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: "old-pass",
          newPassword: "new-pass1",
          confirmPassword: "new-pass1",
        }),
      }),
    );

    expect(success.status).toBe(200);
    expect(success.headers.get("set-cookie") ?? "").toContain("admin_session=");
  });

  it("maps change-username service errors and returns the new username", async () => {
    vi.mocked(authService.changeUsername).mockResolvedValueOnce({
      ok: false,
      error: "USERNAME_UNCHANGED",
    });

    const failed = await changeUsername(
      new Request("http://localhost/api/auth/change-username", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: "secret-pass",
          newUsername: "admin",
        }),
      }),
    );
    expect(failed.status).toBe(400);

    vi.mocked(authService.changeUsername).mockResolvedValueOnce({
      ok: true,
      username: "maintainer",
    });
    const success = await changeUsername(
      new Request("http://localhost/api/auth/change-username", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: "secret-pass",
          newUsername: "maintainer",
        }),
      }),
    );

    expect(success.status).toBe(200);
    await expect(success.json()).resolves.toEqual({
      authenticated: true,
      username: "maintainer",
    });
  });
});

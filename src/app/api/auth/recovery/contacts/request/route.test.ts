import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
} from "@/server/services/sessionService";

const serviceMock = vi.hoisted(() => ({
  requestCode: vi.fn(),
}));

vi.mock("@/server/services/recoveryEmailVerificationService", () => ({
  recoveryEmailVerificationService: serviceMock,
}));

import { POST } from "@/app/api/auth/recovery/contacts/request/route";

function createRequest(body: unknown, authenticated = true) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (authenticated) {
    const token = createSessionToken("admin");
    headers.set(
      "cookie",
      `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    );
  }

  return new Request(
    "http://localhost/api/auth/recovery/contacts/request",
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/auth/recovery/contacts/request", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_USERNAME", "admin");
    vi.stubEnv("ADMIN_PASSWORD", "secret-pass");
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
    serviceMock.requestCode.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("rejects unauthenticated requests before sending email", async () => {
    const response = await POST(
      createRequest(
        { currentPassword: "secret-pass", email: "new@example.com" },
        false,
      ),
    );

    expect(response.status).toBe(401);
    expect(serviceMock.requestCode).not.toHaveBeenCalled();
  });

  it("returns the pending destination after sending a code", async () => {
    serviceMock.requestCode.mockResolvedValue({
      ok: true,
      pendingEmail: "new@example.com",
      maskedDestination: "ne*@example.com",
      expiresInMinutes: 10,
    });

    const response = await POST(
      createRequest({
        currentPassword: "secret-pass",
        email: "new@example.com",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      pendingEmail: "new@example.com",
      maskedDestination: "ne*@example.com",
      expiresInMinutes: 10,
    });
  });

  it("returns retry guidance when another code is requested too soon", async () => {
    serviceMock.requestCode.mockResolvedValue({
      ok: false,
      error: "RATE_LIMITED",
      retryAfter: 42,
    });

    const response = await POST(
      createRequest({
        currentPassword: "secret-pass",
        email: "new@example.com",
      }),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("42");
    await expect(response.json()).resolves.toMatchObject({
      retryAfter: 42,
    });
  });

  it("returns a safe error for unexpected failures", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    serviceMock.requestCode.mockRejectedValue(new Error("database unavailable"));

    const response = await POST(
      createRequest({
        currentPassword: "secret-pass",
        email: "new@example.com",
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to send verification code. Please try again later.",
    });
  });
});

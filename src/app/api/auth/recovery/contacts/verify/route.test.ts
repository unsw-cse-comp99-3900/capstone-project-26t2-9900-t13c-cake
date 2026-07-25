import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
} from "@/server/services/sessionService";

const serviceMock = vi.hoisted(() => ({
  verifyCode: vi.fn(),
}));

vi.mock("@/server/services/recoveryEmailVerificationService", () => ({
  recoveryEmailVerificationService: serviceMock,
}));

import { POST } from "@/app/api/auth/recovery/contacts/verify/route";

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
    "http://localhost/api/auth/recovery/contacts/verify",
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/auth/recovery/contacts/verify", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_USERNAME", "admin");
    vi.stubEnv("ADMIN_PASSWORD", "secret-pass");
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
    serviceMock.verifyCode.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("rejects unauthenticated requests before checking a code", async () => {
    const response = await POST(
      createRequest({ verificationCode: "123456" }, false),
    );

    expect(response.status).toBe(401);
    expect(serviceMock.verifyCode).not.toHaveBeenCalled();
  });

  it("returns the newly verified recovery email", async () => {
    serviceMock.verifyCode.mockResolvedValue({
      ok: true,
      email: "new@example.com",
    });

    const response = await POST(
      createRequest({ verificationCode: "123456" }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      email: "new@example.com",
    });
  });

  it("does not accept an incorrect verification code", async () => {
    serviceMock.verifyCode.mockResolvedValue({
      ok: false,
      error: "INVALID_RECOVERY_CODE",
    });

    const response = await POST(
      createRequest({ verificationCode: "111111" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Verification code is incorrect.",
    });
  });

  it("returns a safe error for unexpected failures", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    serviceMock.verifyCode.mockRejectedValue(new Error("database unavailable"));

    const response = await POST(
      createRequest({ verificationCode: "123456" }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to verify the email address. Please try again later.",
    });
  });
});

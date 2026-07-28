import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
} from "@/server/services/sessionService";

const serviceMock = vi.hoisted(() => ({
  getStatus: vi.fn(),
}));

vi.mock("@/server/services/recoveryEmailVerificationService", () => ({
  recoveryEmailVerificationService: serviceMock,
}));

import { GET } from "@/app/api/auth/recovery/contacts/route";

function createAuthenticatedRequest() {
  const token = createSessionToken("admin");
  return new Request("http://localhost/api/auth/recovery/contacts", {
    headers: {
      cookie: `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    },
  });
}

describe("GET /api/auth/recovery/contacts", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_USERNAME", "admin");
    vi.stubEnv("ADMIN_PASSWORD", "secret-pass");
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
    serviceMock.getStatus.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await GET(
      new Request("http://localhost/api/auth/recovery/contacts"),
    );

    expect(response.status).toBe(401);
    expect(serviceMock.getStatus).not.toHaveBeenCalled();
  });

  it("returns the active and pending recovery email state", async () => {
    serviceMock.getStatus.mockResolvedValue({
      email: "active@example.com",
      pendingEmail: "new@example.com",
      maskedPendingEmail: "ne*@example.com",
    });

    const response = await GET(createAuthenticatedRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      email: "active@example.com",
      pendingEmail: "new@example.com",
      maskedPendingEmail: "ne*@example.com",
    });
  });

  it("returns a safe error when the settings cannot be loaded", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    serviceMock.getStatus.mockRejectedValue(new Error("database unavailable"));

    const response = await GET(createAuthenticatedRequest());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to load recovery email settings.",
    });
  });
});

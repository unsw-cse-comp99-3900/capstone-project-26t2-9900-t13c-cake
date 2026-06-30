import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
  verifySessionToken,
} from "@/server/services/sessionService";

describe("sessionService (CAKE-10)", () => {
  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates and verifies a valid session token", () => {
    const token = createSessionToken("admin");
    const session = verifySessionToken(token);

    expect(session).not.toBeNull();
    expect(session?.username).toBe("admin");
    expect(session?.exp).toBeGreaterThan(Date.now());
  });

  it("rejects tampered session tokens", () => {
    const token = createSessionToken("admin");
    const tampered = `${token}tampered`;

    expect(verifySessionToken(tampered)).toBeNull();
  });

  it("rejects expired session tokens", () => {
    vi.useFakeTimers();
    const token = createSessionToken("admin");

    vi.setSystemTime(Date.now() + 9 * 60 * 60 * 1000);
    expect(verifySessionToken(token)).toBeNull();

    vi.useRealTimers();
  });

  it("exports the admin session cookie name", () => {
    expect(ADMIN_SESSION_COOKIE).toBe("admin_session");
  });
});

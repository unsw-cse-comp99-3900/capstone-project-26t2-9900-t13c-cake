import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateOneTimeRecoveryCode,
  hashOneTimeRecoveryCode,
  isValidOneTimeRecoveryCode,
} from "@/server/utils/recoveryCodeUtils";

describe("recoveryCodeUtils (CAKE-10)", () => {
  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("generates a 6-digit one-time recovery code", () => {
    expect(generateOneTimeRecoveryCode()).toMatch(/^\d{6}$/);
  });

  it("validates one-time recovery code shape", () => {
    expect(isValidOneTimeRecoveryCode("123456")).toBe(true);
    expect(isValidOneTimeRecoveryCode("12345")).toBe(false);
    expect(isValidOneTimeRecoveryCode("abcdef")).toBe(false);
  });

  it("hashes one-time recovery codes with the session secret", () => {
    const hash = hashOneTimeRecoveryCode("123456");
    const expected = createHmac("sha256", "test-session-secret")
      .update("123456")
      .digest("hex");
    expect(hash).toBe(expected);
  });
});

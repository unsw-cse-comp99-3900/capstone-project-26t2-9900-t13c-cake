import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateOneTimeRecoveryCode,
  hashOneTimeRecoveryCode,
  isRecoveryConfigured,
  isValidOneTimeRecoveryCode,
  verifyRecoveryCode,
} from "@/server/utils/recoveryCodeUtils";

describe("recoveryCodeUtils (CAKE-10)", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_RECOVERY_CODE", "supervisor-recovery-code");
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports configured recovery when env var is present", () => {
    expect(isRecoveryConfigured()).toBe(true);
  });

  it("verifies the recovery code with a timing-safe comparison", () => {
    expect(verifyRecoveryCode("supervisor-recovery-code")).toBe(true);
    expect(verifyRecoveryCode("wrong-code")).toBe(false);
  });

  it("generates and validates six-digit one-time codes", () => {
    const code = generateOneTimeRecoveryCode();
    expect(code).toMatch(/^\d{6}$/);
    expect(isValidOneTimeRecoveryCode(code)).toBe(true);
    expect(isValidOneTimeRecoveryCode("12345")).toBe(false);
  });

  it("hashes one-time codes deterministically without storing plaintext", () => {
    const hash = hashOneTimeRecoveryCode("123456");
    expect(hash).toBe(hashOneTimeRecoveryCode("123456"));
    expect(hash).not.toContain("123456");
  });
});

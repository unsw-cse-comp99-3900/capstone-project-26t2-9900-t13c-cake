import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isRecoveryConfigured,
  verifyRecoveryCode,
} from "@/server/utils/recoveryCodeUtils";

describe("recoveryCodeUtils (CAKE-10)", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_RECOVERY_CODE", "supervisor-recovery-code");
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
});

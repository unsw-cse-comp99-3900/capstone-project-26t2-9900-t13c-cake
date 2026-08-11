import { adminAccountRepository } from "@/server/repositories/adminAccountRepository";
import { recoveryDeliveryService } from "@/server/services/recoveryDeliveryService";
import {
  generateOneTimeRecoveryCode,
  hashOneTimeRecoveryCode,
  isValidOneTimeRecoveryCode,
  RECOVERY_CODE_RESEND_SECONDS,
  RECOVERY_CODE_TTL_MINUTES,
} from "@/server/utils/recoveryCodeUtils";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(2, local.length - visible.length))}@${domain}`;
}

/** Layer 3 — verify a new recovery email before it replaces the saved contact (CAKE-10). */
export const recoveryEmailVerificationService = {
  async getStatus() {
    const state = await adminAccountRepository.getRecoveryEmailVerificationState();
    if (!state) {
      return null;
    }

    return {
      email: state.contacts.email,
      pendingEmail: state.pendingEmail,
      maskedPendingEmail: state.pendingEmail ? maskEmail(state.pendingEmail) : null,
    };
  },

  async requestCode(currentPassword: string, email: string, now = new Date()) {
    const prepared = await adminAccountRepository.prepareRecoveryEmailChange(
      currentPassword,
      email,
    );
    if (!prepared.ok) {
      return prepared;
    }

    if (!recoveryDeliveryService.isConfigured()) {
      return { ok: false as const, error: "DELIVERY_NOT_CONFIGURED" as const };
    }

    if (
      prepared.codeSentAt &&
      now.getTime() - prepared.codeSentAt.getTime() < RECOVERY_CODE_RESEND_SECONDS * 1000
    ) {
      const retryAfter = Math.ceil(
        RECOVERY_CODE_RESEND_SECONDS -
          (now.getTime() - prepared.codeSentAt.getTime()) / 1000,
      );
      return { ok: false as const, error: "RATE_LIMITED" as const, retryAfter };
    }

    const code = generateOneTimeRecoveryCode();
    try {
      await recoveryDeliveryService.sendEmail(
        prepared.email,
        code,
        "recovery-email-verification",
      );
    } catch (error) {
      console.error("[recoveryEmailVerificationService] email delivery failed:", error);
      return { ok: false as const, error: "DELIVERY_FAILED" as const };
    }

    const expiresAt = new Date(now.getTime() + RECOVERY_CODE_TTL_MINUTES * 60 * 1000);
    await adminAccountRepository.saveRecoveryEmailVerificationCode(
      prepared.email,
      hashOneTimeRecoveryCode(code),
      expiresAt,
      now,
    );

    return {
      ok: true as const,
      pendingEmail: prepared.email,
      maskedDestination: maskEmail(prepared.email),
      expiresInMinutes: RECOVERY_CODE_TTL_MINUTES,
    };
  },

  async verifyCode(code: string) {
    if (!isValidOneTimeRecoveryCode(code)) {
      return { ok: false as const, error: "INVALID_RECOVERY_CODE" as const };
    }

    return adminAccountRepository.verifyAndApplyRecoveryEmailChange(
      hashOneTimeRecoveryCode(code),
    );
  },
};
